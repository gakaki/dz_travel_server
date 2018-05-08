const _                     = require("lodash");
const travelConfig          = require("../../../sheets/travel");
const QuestRepo             = require("../questService/questRepo");
const timeUtil              = require("../../utils/time");
const mongoose              = require('mongoose');
const configDebug           = require('../../../debug/debug');
const QuestAnswer           = require("../questService/questAnswer");

class MakeEvent { //注意只有在type 1 和 2 的观光随机事件才行

    constructor( obj ){

        this.timeTotalHour  = obj.timeTotalHour || 0;
        this.isNewPlayer    = obj.isNewPlayer || 0;
        this.cid            = obj.cid || 0;
        this.weather        = obj.weather || 0;
        this.today          = obj.today || 0;
        this.itemSpecial    = obj.itemSpecial || 0;
        this.spotId         = obj.spotId || 0;

        this.questsSet      = new Set();
        this.quests         = this.getQuestsPool()

        this.allProbility   = this.quests.map( q => q.probability).filter(n => true);
        this.totalProbility = this.allProbility.reduce((sum, x) => sum + x);

        this.questsView     = [];
        this.events         = []; //最后生成的随机事件
        this.eventsFormat   = [];
        this.genEventNonSpot();  // 生成事件(非景点)
    }

    //根据 contructor中的obj 筛选配置表中存入池中  随机出现random quest
    getQuestsPool(){
        //根据参数筛选出的quest repo表过滤过的内容
        let quests = QuestRepo.filterRandomQuests(
            {
                cid: this.cid,
                weather: this.weather,
                today: this.today,
                itemSpecial: this.itemSpecial,
                spotId: this.spotId
            }
        );
        // 从小到大排序权重
        quests     = quests.sort( (a,b) => {
            return a.probability - b.probability;
        });
        return quests;
    }

    async genEventNonSpot(){

        let eventRows       = [];
        let timeTotalMinute = this.timeTotalHour * 60;
        let timestamp       = new Date().getTime();

        //默认先生成一条
        let dbRow               = this.genSingleEventNonSpot( new Date().getTime() );
        eventRows.push(dbRow);
        if (configDebug.EVENTGENINIITAL)
        {
            for (let i=0 ; i< 9 ;i ++ ){
                let dbRow               = this.genSingleEventNonSpot( new Date().getTime() );
                eventRows.push(dbRow);
            }
        }


        //这里暂时不根据时间来生成时间了      11 * 60 / 2  假设走完一个城市8小时走完  每2分钟触发一个事件 240个
        for ( let i= 0; i < 330; i++){
            let minuteLength        =  _.ceil(_.random(1, 5, true), 2) // 随机个1到5分钟的时间出来 4.xx

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
        this.eventsFormat = this.events;
    }



    genSingleEventNonSpot( triggerDateTimeStamp ){

        let quest        = this.randomeOne();
        this.questsView.push(quest);

        let questDbRow   = {
            dbId            : mongoose.Types.ObjectId(),
            triggerDate     : triggerDateTimeStamp,
            eid             : quest.id,
            received        : false,
            type            : quest.type,
            triggerDateYHM  : timeUtil.formatYMDHMS(triggerDateTimeStamp),
            answers         : [],
            wrongs          : [],
            answer          : "",
            picture         : "",
            questionTitle   : ""
        };

        let questAnswer  = new QuestAnswer(quest.id,this.cid);
        if ( quest.type == quest.EventTypeKeys.QA_NO_NEED_RESULT || quest.type == quest.EventTypeKeys.QA_NEED_RESULT ){
            questDbRow['answers']          = questAnswer.answers;       //答案组 有错误答案
            questDbRow['wrongs']           = questAnswer.wrongs;        //错误答案
            questDbRow['answer']           = questAnswer.answer;        //正确答案
            questDbRow['picture']          = questAnswer.picture;       //图片
            questDbRow['questionTitle']    = questAnswer.questionTitle; //问题title
        }
        return questDbRow;
    }

    get_trigger_date( prevTimestamp , minutes  = 0  ){
        let trigger_date =  new Date( prevTimestamp + minutes * 60 * 1000).getTime();
        return trigger_date;
    }

    randomeOne(){
        let quest        = this.randomQuest();
        if (configDebug.QUESTRANDOM){
            quest        = this.randomQuestForDebug(this.cid);
        }
        if (configDebug.QUESTSPECIFIC){
            quest        = QuestRepo.find("130050");
        }
        // if ( this.questsSet.has(quest) || !quest || !quest.id ){
        //     // console.log("tmpset added 数据重复了 继续抽");
        //     quest        = this.randomeOne();
        // }else{
        //     this.questsSet.add(quest)
        // }
        return quest;
    }
    randomQuest(){

        let totalProbility      = 0;
        let allProbility        = 0;
        let randomNum           = this.getRandomInt(1, this.totalProbility);
        let prev                = 0;
        let randomEl            = null;
        for ( let q of this.quests ){
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
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    //纯用来测试的哦注意哦
    randomQuestForDebug(option){
        let quests      = QuestRepo.quests.filter( e  => parseInt( e.id) <= 130080 && parseInt( e.id) >= 130010);
         // quests      = QuestRepo.quests.filter( e  =>  e.id == "130020" || e.id == "");
        let randomEl    = _.shuffle(quests)[0];
        return randomEl;
    }


}

module.exports = MakeEvent;




//
//
// // var users = [
// //     { 'user': 'fred',   'age': 48 },
// //     { 'user': 'barney', 'age': 36 },
// //     { 'user': 'fred',   'age': 42 },
// //     { 'user': 'barney', 'age': 34 }
// // ];
// // users = users.sort( (a,b) => {
// //     return a.age < b.age;
// // });
// //
// // console.log(users);
// // console.log(_.ceil(_.random(1, 5, true), 2))
// // return;
//
// // 100次测试生成抽奖的概率计算查看 上海的
//
// let objParametes   = {
//     cid:3,
//     timeTotalHour: 1,
//     weather: 0,
//     today: 0,
//     itemSpecial: 0
// }
// let questGroupBy        =  QuestRepo.groupBy(objParametes);
// let countMap = {}
// console.time('test');
// for ( let i = 0 ; i < 1 ; i++){
//     let er              = new MakeEvent(objParametes);
//     console.log(er.eventsFormat.length);
//     let el              = er.questsView;
//     let probs           = el.map( e => e.probability);
//     let group           = _.groupBy(probs);
//     for (let k in group){
//         group[k] = group[k].length;
//     }
//    console.log(group);
// }
// console.timeEnd('test');

// https://local.ddz2018.com/?sid=042e9de15ad6a0688e040eb7b1b27f9d&uid=ov5W35R-9V5h7f0gpZOJVNJuyabE&cid=101&line=[100107,100102,100109]&appName=travel&action=tour.tourstart





