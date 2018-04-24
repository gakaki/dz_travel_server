const  apis = require("../../../apis/travel");

const travelConfig = require("../../../sheets/travel");
const Quest        = require("./quest");
const calendar = require("lunar-calendar");
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

        return this.quests.filter( e  => {
            let conditionBelong = false;
            if(e.belong == option.cid || !e.belong){
                conditionBelong = true;
            }
            let conditionType = false;
            if(e.trigger_type == e.TriggerTypeKeys.TOUR_COMMON || e.trigger_type == e.TriggerTypeKeys.TOUR_CITY){
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
               return e
           }
        });
    }

}

module.exports = new QuestRepo();

// let n            = new QuestRepo();
// let quest        = n.find("110139");
// let res          = quest.getSpotRewardComment();
// let question     = quest.describe;
// let answers      = quest.answers();
// console.log(quest.type,res,question,answers);

// let n            = new QuestRepo();
// let quest        = n.find("110139");
// let res          = quest.getSpotRewardComment();
// let question     = quest.describe;
// let answers      = quest.answers();
// console.log(quest.type,res,question,answers);


	// 你好像有点迷路了，看来要耽误时间了，早知道找个导游了。	1		0	1	0	6.jpg				2:4,3:10	0	0	0	0	0	100	0							0

//
//
// let n            = new QuestRepo();
// let quest        = n.find("110136");
// let res          = quest.getSpotRewardComment();
// console.log(quest.type,res);

// let questConfigs = [130010,
// 130020,
// // 130030,
// // 130040,
// 130050,
// 130060,
// 130061,
// 130070,
// 130080,
// 130090,
// 130200,
// 130201,
// 130202,
// 130203,
// 130204,
// 130205,
// 130206,
// 130207,
// 130208,
// 130209];
//
// for (let q of questConfigs){
//    let quest        = n.find(q);
//    let cid          = 1;
//    let spotId       = 100101;
//    let res          = quest.describeFormat(cid ,spotId);
//
//    console.log(res);
//    res              = quest.describeFormat(1 );
//    console.log(res);
//
//     res              = quest.describeFormat(null,100101 );
//     console.log(res);
// }

//
// // type 1 金币
// let quest        = n.find("400037");
// let res          = quest.getSpotRewardComment();
// console.log(res);
//


// let n            = new QuestRepo();
// // type 1 金币
// let quest        = n.find("130204");
// let res          = quest.getSpotRewardComment();
// console.log(res);
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