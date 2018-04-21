const travelConfig = require("../../../sheets/travel");
const Quest        = require("./quest");

class QuestRepo {
    find(row_id) {
        return this.quests.find( e  => e.id == row_id );
    }
    constructor() {
        this.quests = []
        for(let row of travelConfig.events){
            this._add(row)
        }
    }
    _add(row){
        let quest = new Quest(row);
        this.quests.push(quest)
    }
    update(quest){}
    remove(quest){}
    query(specification){}


    filterQuests(option){
         return this.quests.filter( e  => (
            (e.belong == option.cid || !e.belong) &&
            (e.trigger_type  == e.TriggerTypeKeys.RANDOM_COMMON ||  e.trigger_type == e.TriggerTypeKeys.RANDOM_CITY)
        ));
            // e.cid                == option.cid &&
            // e.condition3_weather == option.weather &&
            // e.condition3_date    == option.today &&
            // e.condition4_        == option.itemSpecial &&
            //表示为游玩事件
    }
    filterTourQuests(option) {
        return this.quests.filter( e  => (
            (e.belong == option.cid || !e.belong) &&
            (e.trigger_type  == e.TriggerTypeKeys.TOUR_COMMON ||  e.trigger_type == e.TriggerTypeKeys.TOUR_CITY)
        ));
    }

}

module.exports = new QuestRepo();


// let n            = new QuestRepo();
// // type 1 金币
// let quest        = n.find("400037");
// let res          = quest.getSpotRewardComment();
// console.log(res);
//


// let n            = new QuestRepo();
// // type 1 金币
// let quest        = n.find("110033");
// let res          = quest.getSpotRewardComment();
// console.log(res);
//
//  res             = quest.getRewardNormal();
// console.log(res);
// //答题型抹去
// // type 1 金币CAMERA
//  quest        = n.find("130010");
//  res          = quest.getSpotRewardComment();
// console.log(res);
//
//
// // type 2 积分
//  quest     = n.find("110020");
//  res       = quest.getSpotRewardComment();
// console.log(res)
//
// // type 3 时间
//  quest     = n.find("200025");
//  res       = quest.getSpotRewardComment();
// console.log(res);
// // //type 4 特产
//  quest     = n.find("200030");
//  res       = quest.getSpotRewardComment();
// console.log(res);
// // type 5 明信片
//  quest     = n.find("200009");
//  res       = quest.getSpotRewardComment();
// console.log(res);
//
//
//
// // 混合型测试 200050
// quest     = n.find("200050");
// res       = quest.getSpotRewardComment();
// console.log(res);
//
// // 混合型测试 200068
// quest     = n.find("200068");
// res       = quest.getSpotRewardComment();
// console.log(res);
//
//
// quest        = n.find("200004");
// res          = quest.getRewardNormal();
// console.log(res);