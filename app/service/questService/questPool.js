const _                     = require("lodash");
const travelConfig          = require("../../../sheets/travel");
const QuestRepo             = require("../questService/questRepo");
const timeUtil              = require("../../utils/time");
const mongoose              = require('mongoose');
const configDebug           = require('../../../debug/debug');
const QuestAnswer           = require("../questService/questAnswer");

class QuestPool { //注意只有在type 1 和 2 的观光随机事件才行

    constructor( obj ){

        this.timeTotalHour  = obj.timeTotalHour || 0;
        this.isNewPlayer    = obj.isNewPlayer || 0;
        this.cid            = obj.cid || 0;
        this.weather        = obj.weather || 0;
        this.today          = obj.today || 0;
        this.itemSpecial    = obj.itemSpecial || 0;
        this.spotId         = obj.spotId || 0;

        this.quests         = this.getQuestsPool()

        this.allProbility   = this.quests.map( q => q.probability).filter(n => true);
        this.totalProbility = this.allProbility.reduce((sum, x) => sum + x);

        // this.event          = this.genEvent();
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

    genEvent(){
        //要根据概率和各种条件来生成一条数据
        //所以有个条件事件库来寸已经触发了什么
        //规划过了就会有这些事件
        let quest        = this.randomOne();
        let questDbRow   = {
            eid             : quest.id,
            received        : false,
            type            : quest.type,
            createdAt       : timeUtil.currentYMDHMS(),
            answers         : [],
            wrongs          : [],
            answer          : quest.aan,
            picture         : quest.picture,
            questionTitle   : quest.describe,
            sended          : false,
            sendedTime      : null,
            is_question     : false,
        };

        let questAnswer  = new QuestAnswer(quest.id,this.cid);
        if ( quest.type == quest.EventTypeKeys.QA_NO_NEED_RESULT || quest.type == quest.EventTypeKeys.QA_NEED_RESULT ){
            questDbRow['is_question']      = true;                      //是否问答题
            questDbRow['answers']          = questAnswer.answers;       //答案组 有错误答案
            questDbRow['wrongs']           = questAnswer.wrongs;        //错误答案
            questDbRow['answer']           = questAnswer.answer;        //正确答案
            questDbRow['picture']          = questAnswer.picture;       //图片
            questDbRow['questionTitle']    = questAnswer.questionTitle; //问题title
        }
        return questDbRow;
    }

    randomOne(){
        let quest        = this.randomQuest();
        if (configDebug.QUESTRANDOM){
            quest        = this.randomQuestForDebug(this.cid);
        }
        if (configDebug.QUESTSPECIFIC){
            quest        = QuestRepo.find("130050");
        }

        // if ( this.questsSet.has(quest) || !quest || !quest.id ){
        //     // console.log("tmpset added 数据重复了 继续抽");
        //     quest        = this.randomOne();
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
        let testConfigIds       = [130010,130020,130030,130040, 130050,130060,130061,130070,130080,130200
            ,130201,130202,130203, 130204, 130205, 130206, 130207, 130208, 130209];
        let quests              = QuestRepo.findByArray(testConfigIds);
        //quests                = QuestRepo.quests.filter( e  => parseInt( e.id) <= 130080 && parseInt( e.id) >= 130010);
        let randomEl            = _.shuffle(quests)[0];
        return randomEl;
    }
}
module.exports = QuestPool;




