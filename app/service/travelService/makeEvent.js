const _                     = require("lodash");
const travelConfig          = require("../../../sheets/travel");
const QuestRepo             = require("../questService/questRepo");

class MakeEvent {

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
                id              : e.eid,
                minuteLength    : e.minuteLength,
                received        : false,
                quest           : e.quest
            }
        })

    }

    async genEventNonSpot(){
        let eventRows = [];
        let timeTotalMinute = this.timeTotalHour * 60;
        while ( timeTotalMinute > 0 ) {
            let dbRow = this.genSingleEventNonSpot();
            eventRows.push(dbRow);
            timeTotalMinute = timeTotalMinute - dbRow.minuteLength;
        }
        //创建数据库吧
        this.events = eventRows;
        //将事件发生顺序写入数据库
        // await this.ctx.model.CurrentCity.create(eventRows);
    }
    genSingleEventNonSpot(){
        let minuteLength =  _.random(5,15); // 随机个5到15分钟的时间出来
        let quest        = this.randomQuest();

        let triggerDate  = this.get_trigger_date( minuteLength );
        let questDbRow   = {
            triggerDate     : triggerDate,
            eid             : quest.id,
            received        : false,
            minuteLength    : minuteLength,
            quest           : quest
        };
        return questDbRow;
    }


    randomQuest(){
        let quests = QuestRepo.filter(
            {
                // cid :       this.cid,
                // weather:    this.weather,           //天气
                // today:      this.today,             //特定日期
                // itemSpecial:this.itemSpecial,       //特定道具
            }
        );
        //根据权重进行 随机 这里暂时偷懒为了快点出来先
        let randomEl = _.shuffle(quests)[0];
        return randomEl;
    }

    get_trigger_date( minutes  = 0, dt = new Date() ){
        let trigger_date =  new Date(dt.getTime() + minutes*60000);
        return trigger_date;
    }
}

module.exports = MakeEvent;

// // https://local.ddz2018.com/?sid=042e9de15ad6a0688e040eb7b1b27f9d&uid=ov5W35R-9V5h7f0gpZOJVNJuyabE&cid=101&line=[100107,100102,100109]&appName=travel&action=tour.tourstart
// let objParametes   = {
//     timeTotalHour  : 14,
//     cid            : 101,
//     weather        : 0,
//     today          : 0,
//     itemSpecial    : 0
// };
// let er      = new MakeEvent(objParametes);
// console.log(er.eventsFormat);
//
