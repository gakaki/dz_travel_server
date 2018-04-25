const  apis = require("../../../apis/travel");

const travelConfig = require("../../../sheets/travel");
const Quest        = require("./quest");
const calendar = require("lunar-calendar");
class QuestRepo {
    find(row_id) {
        return this.quests.find( e  => e.id == row_id );
    }
    constructor() {
        let rows = travelConfig.events.filter(  e=> e.describe.indexOf("s%") < 0 )
        this.quests = []
        for(let row of rows){
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

        return this.quests.filter( e  => {
            let conditionBelong = false;
            //console.log(e.belong);
            if(e.belong == option.cid || !e.belong || e.belong == option.spotId) {
                conditionBelong = true;
            }
            let conditionType = false;
            if(e.trigger_type == e.TriggerTypeKeys.TOUR_COMMON || e.trigger_type == e.TriggerTypeKeys.TOUR_CITY) {
                conditionType = true;
            }
            let conditionTime = false;
            let today = option.today;
            let timetype = e.condition2_date[0];
            if(Number(timetype)) {
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


           if(conditionBelong && conditionType && conditionTime && conditionWeather && conditionCar && conditionM) {
              // console.log(e.belong);
               return e
           }
        });
    }

}

module.exports = new QuestRepo();

