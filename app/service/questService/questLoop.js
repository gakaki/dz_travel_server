const moment            = require("moment");
const travelConfig      = require("../../../sheets/travel");
const util              = require("util");
const _                 = require("lodash");
const specialityRepo    = require("./specialityRepo");
const scenicspotRepo    = require("./scenicspotRepo");
const cityRepo          = require("./cityRepo");
const questRepo          = require("./questRepo");
const QuestPool          = require("./questPool");
const timeUtil           = require("../../utils/time");


/*
        let qp             = new QuestLoop(uid,cid,spotId);
        let currentEvents  = qp.getEvents();
        info.newEvent      = qp.hasNewEvent();
        info.latestEvent   = qp.latestEvent();
* */
class QuestLoop {

    constructor( appInstance, uid , cid = null , spotId = null ) {
        this.uid    = uid;
        this.cid    = cid;
        this.spotId = spotId;
        this.events = [];
        this.app    = appInstance;

        this.EVENT_STATUS_NORMAL = 'normal';
        this.EVENT_STATUS_PAUSE  = 'pause';

        //只有调用了pause 那么就是到达终点的时候是pause了
        this.totalLimit          = travelConfig.Parameter.Get(travelConfig.Parameter.EVENTMAX).cfg.value;
        this.KEY_EVENT_PREV_TIME = `${this.uid}:event:prevtime`;
        this.KEY_EVENT_LIST      = `${this.uid}:event:list`;
        this.KEY_EVENT_STATUS    = `${this.uid}:event:status`;

        this.currentTime         = new Date().getTime();
        this.startMinute         = 1;
        this.endMinute           = 5;
        this.event               = {};

        this.prevCount           = 0;
    }

    async init(){
        this.status              = await this.getStatus();
        this.prevTime            = await this.getPrevTime();
        await this.runIfNotPause();
    }

    async pause(){ //暂停事件生成的运行s
        this.app.getLogger('debugLogger').info(" [questLoop] ","事件循环 暂停");
        await this.app.redis.set( this.KEY_EVENT_STATUS , this.EVENT_STATUS_PAUSE );
    }

    async clear(){ //完全clear这次的数据
        this.app.getLogger('debugLogger').info(" [questLoop] ","事件循环 清除");
        await this.app.redis.delete( this.KEY_EVENT_STATUS );
        await this.app.redis.delete( this.KEY_EVENT_PREV_TIME );
        await this.app.redis.delete( this.KEY_EVENT_LIST );
    }

    async resume(){ //从暂停的事件中恢复
        this.app.getLogger('debugLogger').info(" [questLoop] ","事件循环 恢复继续");
        await this.app.redis.set( this.KEY_EVENT_STATUS , this.EVENT_STATUS_NORMAL );
    }

    async getStatus(){
        let  status  = await this.app.redis.get( this.KEY_EVENT_STATUS );
        if (!status) {
            status   = this.EVENT_STATUS_NORMAL;
            await this.app.redis.set( this.KEY_EVENT_STATUS , this.EVENT_STATUS_NORMAL );
        }
        return status;
    }

    async getPrevTime(){
        let prevTime = await this.app.redis.get( this.KEY_EVENT_PREV_TIME );
        this.app.getLogger('debugLogger').info(" [questLoop] ","上回的事件触发时间", timeUtil.formatYMDHMS(prevTime) , `当前时间`, timeUtil.currentYMDHMS());
        if (!prevTime || prevTime <= 0 ) prevTime = 0;
        return parseInt(prevTime);
    }
    async isStatusPause(){
        //从redis 读取当前状态
        if ( this.getStatus() == this.EVENT_STATUS_PAUSE ){
            this.status  = this.EVENT_STATUS_PAUSE;
        }
        let isStatusPause =  this.status == this.EVENT_STATUS_PAUSE;
        this.app.getLogger('debugLogger').info(" [questLoop] ","isStatusPause是否暂停了 ",isStatusPause);
        return isStatusPause;
    }

    async isExceedLimit(){
        //从redis 读取事件数量
        let events = await this.getEvents();
        let res    = false;
        if ( events &&  Array.isArray(events) && events.length >= this.totalLimit ){
            res    =  true;
        }
        this.app.getLogger('debugLogger').info(" [questLoop] ", "事件数量是否达到最大数值", res ,`当前数量`,this.events.length, `总数量`,this.totalLimit);
        return res;
    }

    async hasNewEvent(){
        let currLength   = await this.getEvents().length;
        if ( currLength > 0 && this.prevCount != currLength ){
            return true;
        }
        this.app.getLogger('debugLogger').info(" [questLoop] ","当前事件长度",currLength,'之前事件长度',this.prevCount);
        return false;
    }
    async latestEvent(){
        if (this.events.length > 0) {
            return this.events[0];
        }
        return null;
    }

    async popEvent(){
         let event = await this.app.redis.lpop(this.KEY_EVENT_LIST);
         if ( event ){
             event = JSON.parse(event);
         }
         return event;
    }

    async getEvents(){
        let events = await this.app.redis.lrange(this.KEY_EVENT_LIST,0, this.totalLimit);

        if (_.size(events) > 0 ) {

        }else{
            events = [];
        }

        let eventsNew = [];
        for(let row of events){
            row = JSON.parse(row);
            eventsNew.push(row);
        }
        this.events     = eventsNew;
        return this.events;
    }

    //生成一个事件的过程代码
    async genOneEvent(){
        let qp       = new QuestPool({
            cid : this.cid
        }); //生成事件加入队列
        let event    = qp.genEvent();
        event        = JSON.stringify(event);
        this.app.redis.rpush( this.KEY_EVENT_LIST , event );    //增加到事件队列
        return event;
    }

    async getDiffMinute(){
        //对比上一轮的事件 和当前时间 计算事件差 加入事件
        let prevTimeMS     = this.prevTime;
        let diffTimeMS     = Math.abs( this.currentTime - prevTimeMS );
        let diffMinute     = _.ceil(diffTimeMS / 1000 / 60 ,0);
        this.app.getLogger('debugLogger').info(" [questLoop] ", "当前时间为", this.currentTime , timeUtil.formatYMDHMS(this.currentTime));
        this.app.getLogger('debugLogger').info(" [questLoop] ", "上回时间为", prevTimeMS ,       timeUtil.formatYMDHMS(prevTimeMS) );
        this.app.getLogger('debugLogger').info(" [questLoop] ", "时间差(毫秒)为",                 diffTimeMS / 1000 / 60 );
        this.app.getLogger('debugLogger').info(" [questLoop] ", "时间差(分钟)为",                 diffMinute );
        return diffMinute;
    }


    async runIfNotPause(){
        let isStatusPause   = await this.isStatusPause();
        if (isStatusPause) return; //状态为暂停 啥都不做
        let isExceedLimit   = await this.isExceedLimit();
        if ( isExceedLimit ) return; //超过最大值 啥都不做

        this.prevCount      = await this.events.length;

        let event           = null;

        if (  this.prevTime <= 0 && this.events){ //应该送一个事件 prevTime为空说明是第一次来 那么就送一个事件
            event            = this.genOneEvent();
        }else{
            let startMinute  = this.startMinute;
            let endMinute    = this.endMinute;
            let randomMinute = _.random(startMinute,endMinute);

            let startMS      = startMinute * 1000;
            let randomMS     = randomMinute * 1000;

            // let diffTime     = await this.getDiffMinute();
            // let isInRange    = startMS <= diffTime && diffTime <= randomMS;
            // this.app.getLogger('debugLogger').info(" [questLoop] ", "是否在事件范围内 startMS <= diffTime && diffTime <= randomMS", startMS , diffTime , randomMS ,isInRange );

            let diffTimeMinute  = await this.getDiffMinute();
            let isInRange       = startMinute <= diffTimeMinute && diffTimeMinute <= randomMinute;

            if (diffTimeMinute <= startMinute){
                this.app.getLogger('debugLogger').info(" [questLoop] ", "事件范围小于等于最小时间", startMinute );
            }
            else if ( isInRange ) {
                this.app.getLogger('debugLogger').info(" [questLoop] ", "在事件范围内 startMinute <= diffTimeMinute && diffTimeMinute <= randomMinute", startMinute , diffTimeMinute , randomMinute ,isInRange );
                event           = await this.genOneEvent();
                //然后设置一下当前记录时间 更新prevtime
                this.app.redis.set( this.KEY_EVENT_PREV_TIME ,this.currentTime );
            }else if ( diffTimeMinute >= endMinute ) {
                //生成n个事件哦
                this.app.getLogger('debugLogger').info(" [questLoop] ", "事件范围大于最长时间 end", endMinute  );
                while ( diffTimeMinute > 0 ) {
                    let minuteLength        =  _.ceil(_.random( this.startMinute, this.endMinute, true) ) // 随机个1到5分钟的时间出来 4.xx
                    this.app.getLogger('debugLogger').info(" [questLoop] ", "随机分钟为", minuteLength  );
                    // if (configDebug.EVENTGENTimeShort){
                    //     minuteLength        =  _.random( 1 / 24 , 1/ 12 );
                    //     // minuteLength        =  _.random( 0, 0 );
                    // }
                    event                   = this.genOneEvent();
                    diffTimeMinute          = diffTimeMinute - minuteLength;
                    this.app.getLogger('debugLogger').info(" [questLoop] ", "剩余时间为", diffTimeMinute  );
                }
                //然后设置一下当前记录时间 更新prevtime
                this.app.redis.set( this.KEY_EVENT_PREV_TIME ,this.currentTime );
            }
        }

        this.app.getLogger('debugLogger').info(" [questLoop] ", "生成的新事件", event );
        await this.getPrevTime();
    }

    toString() {
        let reward      = `${this.quest.getSpotRewardComment().reward}`;
        let rewardFail  = `${this.quest.getSpotErrorRewardComment().reward}`;
        let res         =
            `${this.quest.id}  问题为: ${this.questionTitle}
 ----是否问答题： ${this.isSpecialKnowledge() ? `是`:'否'}
        答案为: ${this.answer},
     所有对的为: ${this.allrights},
        错误为: ${this.wrongs}
        answers为: ${this.answers}
        图片为: ${this.picture}
        奖励为：${reward}
        错误奖励为：${rewardFail}`
        return res;
    }
}

module.exports =  QuestLoop;

