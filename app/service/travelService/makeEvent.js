const _                     = require("lodash");
const travelConfig          = require("../../../sheets/travel");
const QuestRepo             = require("../questService/questRepo");
const timeUtil              = require("../../utils/time");
const mongoose              = require('mongoose');
const configDebug           = require('../../../debug/debug');

class MakeEvent { //注意只有在type 1 和 2 的观光随机事件才行

    constructor( obj ){

        this.timeTotalHour  = obj.timeTotalHour || 0;
        this.isNewPlayer    = obj.isNewPlayer || 0;
        this.cid            = obj.cid || 0;
        this.weather        = obj.weather || 0;
        this.today          = obj.today || 0;
        this.itemSpecial    = obj.itemSpecial || 0;
        this.spotId         = obj.spotId || 0;

        this.events         = []; //最后生成的随机事件
        this.eventsFormat   = [];
        this.genEventNonSpot();  // 生成事件(非景点)
        this.formatEvents();
    }

    async formatEvents(){
        this.eventsFormat =  this.events.map( e => {
            return {
                dbId            : e.dbId,
                eid             : e.eid,
                type            : e.type,
                received        : false,                 //似乎没有必要 是记录在另一张表内
                triggerDate     : e.triggerDate,
                triggerDateYHM  : e.triggerDateYHM,
                // quest           : e.quest
                // minuteLength    : e.minuteLength,     //似乎没有必要
            }
        })
    }

    async genEventNonSpot(){

        let eventRows       = [];
        let timeTotalMinute = this.timeTotalHour * 60;
        let timestamp       = new Date().getTime();

        //默认先生成一条
        let dbRow               = this.genSingleEventNonSpot( new Date().getTime() );
        eventRows.push(dbRow);

        //这里暂时不根据时间来生成时间了
        for ( let i= 0; i < 400; i++){
            let minuteLength        =  _.random( 1 ,4); // 随机个1到2分钟的时间出来

            if (configDebug.EVENTGEN){
                minuteLength        =  _.random( 0 , 0);
            }

            //这里的时间生成逻辑需要递增
            let triggerTimeStamp    = this.get_trigger_date( timestamp , minuteLength );

            let dbRow               = this.genSingleEventNonSpot( triggerTimeStamp );
            eventRows.push(dbRow);
            //循环生成新的事件
            timestamp               = triggerTimeStamp;
        }
        // while ( timeTotalMinute > 0 ) {

        //创建数据库吧
        this.events = eventRows;
    }

    genSingleEventNonSpot( triggerDateTimeStamp ){

        let quest        = this.randomQuest();
        if (configDebug.QUESTRANDOM){
            quest        = this.randomQuestForDebug(this.cid);
        }

        let questDbRow   = {
            dbId            : mongoose.Types.ObjectId(),
            triggerDate     : triggerDateTimeStamp,
            eid             : quest.id,
            received        : false,
            type            : quest.type,
            triggerDateYHM  : timeUtil.formatYMDHMS(triggerDateTimeStamp)
            // minuteLength    : minuteLength,
            // quest           : quest
        };
        return questDbRow;
    }

    get_trigger_date( prevTimestamp , minutes  = 0  ){
        let trigger_date =  new Date( prevTimestamp + minutes * 60 * 1000).getTime();
        return trigger_date;
    }

    randomQuest(){
        //随机出现random quest
        let quests = QuestRepo.filterRandomQuests(
            {
                cid: this.cid,
                weather: this.weather,
                today: this.today,
                itemSpecial: this.itemSpecial,
                spotId: this.spotId
            }
        );


        let totalProbility  = _.sum(quests.map( q => parseInt(q.probability) ));
        let randomNum       = _.random(1, totalProbility);

        let prev            = 0;
        let randomEl        = null;
        for ( let q of quests ){
            if (!q.probability){
                throw new Error("注意配置表的probilitiy出错了注意！");
                continue;
            }

            let nextValue   = prev + q.probability;
            if ( randomNum  >= prev && randomNum < nextValue ){
                randomEl    = q; //落入该奖品区间
                break;
            }
            prev = nextValue ;
        }
        return randomEl;
    }

    //纯用来测试的哦注意哦
    randomQuestForDebug(option){
        let quests      = QuestRepo.quests.filter( e  => (
            (e.belong == option.cid || !e.belong) &&a
            (e.trigger_type  == e.TriggerTypeKeys.RANDOM_COMMON ||  e.trigger_type == e.TriggerTypeKeys.RANDOM_CITY) &&
            // (e.type  == e.EventTypeKeys.QA_NO_NEED_RESULT ||  e.trigger_type == e.EventTypeKeys.QA_NEED_RESULT)
            e.type == e.EventTypeKeys.COMMON
        ));
        //根据权重进行 随机 这里暂时偷懒为了快点出来先
        let randomEl    = _.shuffle(quests)[0];
        return randomEl;
    }


}

module.exports = MakeEvent;

//100次测试生成抽奖的概率计算查看
// let countMap = {}
// for(let i=0 ; i < 100; i ++ ){
//     let objParametes   = {
//         timeTotalHour: 1,
//         cid: 101,
//         weather: 0,
//         today: 0,
//         itemSpecial: 0
//     }
//     let er              = new MakeEvent(objParametes);
//     let el              = er.randomQuest();
//     // console.log(el.probability,  el.describe);
//
//     if (!countMap[el.probability]){
//         countMap[el.probability] = [];
//     }
//     countMap[el.probability].push(el);
// };
//
// for ( let k in countMap){
//     // console.log (k,countMap[k]);
//     countMap[k] = countMap[k].length;
// }
// console.log(countMap);

// https://local.ddz2018.com/?sid=042e9de15ad6a0688e040eb7b1b27f9d&uid=ov5W35R-9V5h7f0gpZOJVNJuyabE&cid=101&line=[100107,100102,100109]&appName=travel&action=tour.tourstart





