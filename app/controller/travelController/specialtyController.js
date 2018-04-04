const Controller = require('egg').Controller;
const apis = require("../../../apis/travel");
const utils = require("../../utils/utils");
const travelConfig = require("../../../sheets/travel");

//特产买卖相关的
class SpecialtyController extends Controller {
    //购买特产
    async buy(ctx) {
        //买入特产的id 数量
        
        info.submit();
    }
    //卖出特产
    async sell(ctx) {
        //卖出特产的id 数量
        let info = apis.PlayerInfo.Init(ctx);

        let userId = info.uid;


        info.submit();
    }
    //使用特产
    async use(ctx) {
        
        info.submit();
    }

}
module.exports = SpecialtyController;