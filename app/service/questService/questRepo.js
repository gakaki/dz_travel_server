const  apis = require("../../../apis/travel");

const travelConfig = require("../../../sheets/travel");
const Quest        = require("./quest");
const calendar = require("lunar-calendar");
class QuestRepo {
    find(row_id) {
        return this.quests.find( e  => e.id == row_id );
    }

    fetchRows(){
        //注意这里会 filter 的事件
        let rows = travelConfig.events;

        // // .filter(  e=> e.describe.indexOf("s%") < 0 )
        // rows     = rows.filter( e => e.probability != 0 && e.describe.indexOf("s%") < 0);
        return rows;
    }

    constructor() {
        let rows    = this.fetchRows();

        this.quests = []
        for(let row of rows){
            this._add(row)
        }
    }
    _add(row){
        let quest = new Quest(row);
        this.quests.push(quest)
    }

    filterRandomQuests(option){
        let quests = this.filterFirst(option);
        quests     = quests.filter( e => (
            e.trigger_type == e.TriggerTypeKeys.RANDOM_COMMON ||
            e.trigger_type == e.TriggerTypeKeys.RANDOM_CITY)
        );
        return quests;
    }
    filterTourQuests(option){
        let quests = this.filterFirst(option);
        quests     = quests.filter( e => (
            e.trigger_type == e.TriggerTypeKeys.TOUR_COMMON ||
            e.trigger_type == e.TriggerTypeKeys.TOUR_CITY)
        );
        return quests;
    }
    // 过滤需要的数据
    filterFirst(option) {

        return this.quests.filter( e  => {

            let conditionProbility = true;
            if (e.probability <= 0){ //触发几率为0的时候要去除
                conditionProbility = false;
            }

            let conditionBelong = false;
            //console.log(e.belong);

            if(e.belong == option.cid || !e.belong || e.belong == option.spotId) {
                conditionBelong = true;
            }
            // let conditionType = false;
            // if(e.trigger_type == e.TriggerTypeKeys.TOUR_COMMON || e.trigger_type == e.TriggerTypeKeys.TOUR_CITY) {
            //     conditionType = true;
            // }
            let conditionTime = false;
            let today = option.today;
            let timetype = e.condition2_date[0];

            if( today && Number(timetype)) {
                //1 表示阳历 2 表示阴历
                let start = new Date(today.getFullYear() + "-" + e.condition2_date[1]);
                let end = today;
                if(e.condition2_date[2]) {
                    end = new Date(today.getFullYear() + "-" + e.condition2_date[2] + " 23:59:59");
                }else{
                    end = new Date(today.getFullYear() + "-" + e.condition2_date[1] + " 23:59:59");
                }

                if(timetype == 2) {
                    let lunar = calendar.solarToLunar(today.getFullYear(), today.getMonth() + 1, today.getDate());
                    today = new Date(lunar.lunarYear + "-" + lunar.lunarMonth + "-" + lunar.lunarDay);
                }

                if(start <= today && today <= end) {
                    conditionTime = true
                }
            }else{
                conditionTime = true;
            }

            let conditionWeather = false;
            if(Number(e.condition3_weather)) {
               if(e.condition3_weather == option.weatherId) {
                   conditionWeather = true
               }
            }else{
                conditionWeather = true
            }

            let conditionCar = false;
            let conditionM = false;
            //1代表 不拥有医药箱 2 代表有车
            if(Number(e.condition4_)) {
                if(e.condition4_ == 2) {
                    for(let rentItemId in option.itemSpecial) {
                        let rentItem = travelConfig.Shop.Get(rentItemId);
                        if(rentItem.type == apis.RentItem.CAR) {
                            if(option.itemSpecial[rentItem]) {
                                conditionCar = true;
                                break;
                            }
                        }
                    }
                }
               if(e.condition4_ == 1) {
                   for(let rentItemId in option.itemSpecial) {
                       let rentItem = travelConfig.Shop.Get(rentItemId);
                       if(rentItem.type == apis.RentItem.MEDICALBOX) {
                           if(option.itemSpecial[rentItem]) {
                               conditionM = true;
                               break;
                           }
                       }
                   }
               }


            }else{
                conditionCar = true;
                conditionM = true;
            }

            if( conditionProbility && conditionBelong && conditionTime && conditionWeather && conditionCar && conditionM) {
           // if(conditionBelong && conditionType && conditionTime && conditionWeather && conditionCar && conditionM) {
              // console.log(e.belong);
               return e
            }
        });
    }
}

module.exports = new QuestRepo();

// let rows   = new QuestRepo().filterTourQuests({
//     cid : 3 // 上海
// });
//
// // console.log(rows);
// let q    = new QuestRepo();
// let cfg  = q.find("130061");
// let cid  = 3;
// // cfg.dealKnowledgeRow(cid);
// // let describe = cfg.describeFormat(cid);
// // let answers = cfg.answers();
// // console.log(describe,answers);
//
//
// cfg  = q.find("130040");
// cid  = 3;
// cfg.dealKnowledgeRow(cid);
// describe = cfg.describeFormat(cid);
// answers = cfg.answers();
// console.log(describe,answers,cfg.picture);
