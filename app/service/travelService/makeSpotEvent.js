const _                     = require("lodash");
const travelConfig          = require("../../../sheets/travel");
const QuestRepo             = require("../questService/questRepo");
const timeUtil              = require("../../utils/time");

class MakeSpotEvent {

    constructor( obj ){
        this.cid            = obj.cid || 0;
        this.weatherId      = obj.weatherId || 0;
        this.today          = obj.today || 0;
        this.itemSpecial    = obj.rentItems;
        this.event          = {}; //最后生成的随机事件1个
        this.genEvent();  // 生成事件(景点)
    }

    async genEvent(){
        // 事件类型为3 ，4 并且根据三个条件和最后的概率进行生成
        let quests          = QuestRepo.filter({ cid: this.cid });
        //根据权重进行 随机 这里暂时偷懒为了快点出来先
         /* 需要补逻辑
    3、通用观光事件：在所有城市观光都可以触发的事件；
    4、特定观光事件：在特定城市观光才能触发的事件；

    概率一样据说
    关于日期
        格式
        a/b/c
        a：1表示阳历；2表示阴历
        b:月份
        c:日期
        填0表示无日期限制
        a1/b1/c1:a2/b2/c2表示时间段
    关于道具
        0：无限制
        1：不拥有医药箱
        2 拥有自驾车 */

        let randomEl        = _.shuffle(quests)[0];
        this.event          = randomEl;
    }
   
}

module.exports = MakeSpotEvent;


// https://local.ddz2018.com/?sid=042e9de15ad6a0688e040eb7b1b27f9d&uid=ov5W35R-9V5h7f0gpZOJVNJuyabE&cid=101&line=[100107,100102,100109]&appName=travel&action=tour.tourstart
// let objParametes   = {
//     cid            : 101,
//     weather        : 0,
//     itemSpecial    : 0
// };
// let er              = new MakeSpotEvent(objParametes);
// console.log(er.event);
//
