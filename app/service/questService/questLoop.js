const moment            = require("moment");
const travelsConfig     = require("../../../sheets/travel");
const util              = require("util");
const _                 = require("lodash");
const specialityRepo    = require("./specialityRepo");
const scenicspotRepo    = require("./scenicspotRepo");
const cityRepo          = require("./cityRepo");
const questRepo          = require("./questRepo");

class QuestLoop {

    constructor( eid , currentCid = null , spotId = null ) {
        this.quest              = questRepo.find(eid);

    }

    start(){ //记录访问当前时间点
        console.log("事件循环 开始");

    }

    stop(){ //完全清楚这次的数据
        console.log("事件循环 清除");


    }

    pause(){ //暂停时间生成的运行
        console.log("事件循环 清除");


    }

    resume(){ //从暂停的事件中恢复
        console.log("事件循环 恢复继续");

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

