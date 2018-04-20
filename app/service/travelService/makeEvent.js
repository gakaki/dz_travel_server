const _                     = require("lodash");
const travelConfig          = require("../../../sheets/travel");
const QuestRepo             = require("../questService/questRepo");
const timeUtil              = require("../../utils/time");
const mongoose              = require('mongoose');
class MakeEvent { //注意只有在type 1 和 2 的观光随机事件才行

    constructor( obj ){

        this.timeTotalHour  = obj.timeTotalHour || 0;
        this.isNewPlayer    = obj.isNewPlayer || 0;
        this.cid            = obj.cid || 0;
        this.weather        = obj.weather || 0;
        this.today          = obj.today || 0;
        this.itemSpecial    = obj.itemSpecial || 0;
        this.timeTotalHour  = obj.timeTotalHour || 0;

        this.events         = []; //最后生成的随机事件
        this.eventsFormat   = [];
        this.genEventNonSpot();  // 生成事件(非景点)
        this.formatEvents();
    }

    async formatEvents(){
        this.eventsFormat =  this.events.map( e => {
            return {
                id              : e.id,
                eid             : e.eid,
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

        while ( timeTotalMinute > 0 ) {

            let minuteLength        =  _.random(5,15); // 随机个5到15分钟的时间出来
            //这里的时间生成逻辑需要递增
            let triggerTimeStamp    = this.get_trigger_date( timestamp , minuteLength );

            let dbRow               = this.genSingleEventNonSpot( triggerTimeStamp );
            eventRows.push(dbRow);
            timeTotalMinute = timeTotalMinute - minuteLength;

            //循环生成新的事件
            timestamp               = triggerTimeStamp;
        }
        //创建数据库吧
        this.events = eventRows;
        //将事件发生顺序写入数据库
        // await this.ctx.model.CurrentCity.create(eventRows);
    }

    genSingleEventNonSpot( triggerDateTimeStamp ){

        let quest        = this.randomQuest(this.cid);

        let questDbRow   = {
            id              : mongoose.Types.ObjectId(),
            triggerDate     : triggerDateTimeStamp,
            eid             : quest.id,
            received        : false,
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

    randomQuest(option){
        let quests = QuestRepo.filterQuests(
            {
                 cid :       option.cid,
                // weather:    this.weather,           //天气
                // today:      this.today,             //特定日期
                // itemSpecial:this.itemSpecial,       //特定道具
            }
        );
        //根据权重进行 随机 这里暂时偷懒为了快点出来先
        let randomEl = _.shuffle(quests)[0];
        return randomEl;
    }

}

module.exports = MakeEvent;


// // // https://local.ddz2018.com/?sid=042e9de15ad6a0688e040eb7b1b27f9d&uid=ov5W35R-9V5h7f0gpZOJVNJuyabE&cid=101&line=[100107,100102,100109]&appName=travel&action=tour.tourstart
// let objParametes   = {
//     timeTotalHour  : 14,
//     cid            : 101,
//     weather        : 0,
//     today          : 0,
//     itemSpecial    : 0
// };
// let er              = new MakeEvent(objParametes);
// console.log(er.eventsFormat);

