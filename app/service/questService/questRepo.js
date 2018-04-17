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


    filter(option){
        return this.quests.filter( e  => ( e.trigger_type  == e.TriggerTypeKeys.RANDOM_CITY ||  e.trigger_type == e.TriggerTypeKeys.RANDOM_COMMON ));
            // e.cid                == option.cid &&
            // e.condition3_weather == option.weather &&
            // e.condition3_date    == option.today &&
            // e.condition4_        == option.itemSpecial &&

            //表示为游玩事件     

    }
}

module.exports = new QuestRepo();
//
// let n         = new QuestRepo();
// let quest     = n.find("200127");
// let res       = quest.getSpotRewardComment(new Date().getTime());
// console.log(res);
 //export let questRepo = new QuestRepo();