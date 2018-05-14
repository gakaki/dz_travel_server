const moment            = require("moment");
const travelConfig      = require("../../../sheets/travel");
const util              = require("util");
const _                 = require("lodash");
const specialityRepo    = require("./specialityRepo");
const scenicspotRepo    = require("./scenicspotRepo");
const cityRepo          = require("./cityRepo");
const questRepo          = require("./questRepo");


/*
        let qp             = new QuestLoop(uid,cid,spotId);
        let currentEvents  = qp.getEvents();
        info.newEvent      = qp.hasNewEvent();
        info.latestEvent   = qp.latestEvent();
* */
class QuestLoop {

    constructor( uid , cid = null , spotId = null ) {
        this.uid    = uid;
        this.cid    = cid;
        this.spotId = spotId;
        this.events = [];

        this.prevCount           = -1;

        this.EVENT_STATUS_NORMAL = 'normal';
        this.EVENT_STATUS_PAUSE  = 'pause';

        //只有调用了pause 那么就是到达终点的时候是pause了
        this.status              = this.EVENT_STATUS_NORMAL;
        this.totalLimit          = travelConfig.Parameter.Get(travelConfig.Parameter.EVENTMAX).cfg.value;
        this.KEY_EVENT_PREV_TIME = `${this.uid}:event:prevtime`;
        this.KEY_EVENT_LIST      = `${this.uid}:event:list`;
        this.KEY_EVENT_STATUS    = `${this.uid}:event:status`;
    }




    async pause(){ //暂停事件生成的运行s
        console.log("[questLoop]","事件循环 暂停");
        await this.app.redis.set( this.KEY_EVENT_STATUS , this.EVENT_STATUS_PAUSE );
    }

    async clear(){ //完全clear这次的数据
        console.log("[questLoop]","事件循环 清除");
        await this.app.redis.delete( this.KEY_EVENT_STATUS );
        await this.app.redis.delete( this.KEY_EVENT_PREV_TIME );
        await this.app.redis.delete( this.KEY_EVENT_LIST );
    }

    async resume(){ //从暂停的事件中恢复
        console.log("[questLoop]","事件循环 恢复继续");
        await this.app.redis.set( this.KEY_EVENT_STATUS , this.EVENT_STATUS_NORMAL );
    }

    async getStatus(){
        let  status  = await this.app.redis.get( this.KEY_EVENT_STATUS );
        return status;
    }

    async getPrevTime(){
        let prevTime = await this.app.redis.get( this.KEY_EVENT_PREV_TIME );
        if (!prevTime || prevTime <= 0 ) prevTime = 0;
        return prevTime;
    }
    isStatusPause(){
        //从redis 读取当前状态
        if ( this.getStatus() == this.EVENT_STATUS_PAUSE ){
            this.status  = this.EVENT_STATUS_PAUSE;
        }
        return this.status == this.EVENT_STATUS_PAUSE;
    }

    isExceedLimit(){
        //从redis 读取事件数量
        let events = this.getEvents();
        if ( events &&  Array.isArray(events) && events.length >= this.totalLimit ){
            return true;
        }
        return false;
    }

    hasNewEvent(){
        let currLength = this.events.length;
        if ( currLength > 0 && this.prevCount != currLength ){
            return true;
        }
        return false;
    }
    latestEvent(){
        if (this.events.length > 0) {
            return this.events[0];
        }
    }

    getEvents(){
        let events = this.app.redis.lrange(this.KEY_EVENT_LIST,0, this.totalLimit);
        if (events) {
            events = JSON.parse(events);

        }else{
            events = [];
        }
        this.events     = events;
        this.prevCount  = this.events.length;
        return events;
    }

    runIfNotPause(){
        //只要不是pause状态那么就可以继续
        if (this.isStatusPause()) return; //状态为暂停 啥都不做
        if (this.isExceedLimit()) return; //超过最大值 啥都不做

        //对比上一轮的事件 和当前时间 计算事件差 加入事件
        let currentTime  = new Date().getTime();
        let diffTime     = Math.abs( currentTime - this.getPrevTime() );

        let startMinute  = 1;
        let endMinute    = 5;
        let randomMinute = _.random(startMinute,endMinute);
        let startMS      = startMinute * 1000;
        let randomMS     = randomMinute * 1000;
        if ( startMS <= diffTime && diffTime <= randomMS){
            //生成事件加入队列
            let event    = QuestPool.randomOne();
            //更新prevtime
            this.app.redis.set( this.KEY_EVENT_PREV_TIME ,currentTime );
            //增加到事件队列
            event        = JSON.stringify(event);
            this.app.redis.rpush( this.KEY_EVENT_LIST , event );

            return event;
        }else{
            //若是这轮事件没到不更新时间 直到下次随机到
            return null;
        }
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

