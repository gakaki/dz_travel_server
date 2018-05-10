const moment            = require("moment");
const travelsConfig     = require("../../../sheets/travel");
const util              = require("util");
const _                 = require("lodash");
const specialityRepo    = require("./specialityRepo");
const scenicspotRepo    = require("./scenicspotRepo");
const cityRepo          = require("./cityRepo");
const questRepo          = require("./questRepo");

class QuestAnswer {

    constructor( eid , currentCid = null , spotId = null ) {
        this.quest              = questRepo.find(eid);

        this.cid                = currentCid || 1;
        this.spotId             = spotId || 100101;
        this.cfgCity            = travelsConfig.City.Get(currentCid);
        this.cfgSpot            = travelsConfig.Scenicspot.Get(spotId);

        this.currentCityName    = this.cfgCity.city;


        this.questionTitle      = "";
        this.picture            = "";
        this.answer             = "";
        this.wrongs             = [];
        this.answers            = [];

        this.specialKnowledge();
        this.dealQuestionTitle();
    }

    isSpecialKnowledge()
    {
        let res = parseInt(  this.quest.topic ) > 0;
        return res;
    }

    isPictureNeedReplace(){
        let res = this.quest.picture.includes("%s") || this.quest.picture.includes("s%");
        return res;
    }

    specialKnowledge(){
        // if ( this.isSpecialKnowledge() ) {
        //     console.log(`quest.topic ${this.quest.topic}`)
        // }

        let answerAndWrongs     = {};
        let KnowledgeType       = this.quest.KnowledgeKeys;

        // 特产随机
        if ( this.quest.topic == KnowledgeType.SPECIALITY ) {
            answerAndWrongs  = specialityRepo.random4ByCityMoreRange(this.cid);
        }
        // 景点随机
        else if ( this.quest.topic == KnowledgeType.SCENICSPOT ) {
            answerAndWrongs  = scenicspotRepo.random4ByCityMoreRange(this.cid);
        }
        // 城市随机
        else if ( this.quest.topic == KnowledgeType.CITY ) {
            answerAndWrongs  = cityRepo.random4ByCityMoreRange(this.cid);
        }else if ( this.quest.topic == KnowledgeType.NORMAL ) {
            answerAndWrongs  = {
                answer : this.quest.answer,
                wrongs : _.shuffle([this.quest.wrong1,this.quest.wrong2,this.quest.wrong3]),
                picture: this.quest.picture
            }
        }

        this.answer                  = answerAndWrongs.answer;
        this.picture                 = answerAndWrongs.picture;
        if ( this.isPictureNeedReplace() == false){
            this.picture             = this.quest.picture;
        }


        this.wrongs                  = answerAndWrongs.wrongs.filter( n => n );
        this.answers                 = _.shuffle([this.answer].concat(this.wrongs));
    }

    dealQuestionTitle(){ //处理s% 替换字符串
        let dso = this.quest.describeOringal;
        let res = dso.includes("%s") || dso.includes("s%");
        let replaceStr      = /s%/gi;
        if (res)
        {
            this.questionTitle  = this.quest.describeOringal.replace(replaceStr , this.currentCityName);
        }else{
            this.questionTitle  = this.quest.describeOringal;
        }
    }

    toString() {
        let reward      = `${this.quest.getSpotRewardComment().reward}`;
        let rewardFail  = `${this.quest.getSpotErrorRewardComment().reward}`;
        let res         =
`${this.quest.id}  问题为: ${this.questionTitle}
        答案为: ${this.answer}
        错误为: ${this.wrongs}
        answers为: ${this.answers}
        图片为: ${this.picture}
        奖励为：${reward}
        错误奖励为：${rewardFail}`

        return res;
    }
}

module.exports =  QuestAnswer;

