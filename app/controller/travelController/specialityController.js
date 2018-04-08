const Controller = require('egg').Controller;
const apis = require("../../../apis/travel");
const utils = require("../../utils/utils");
const sheets = require("../../../sheets/travel");

//特产买卖相关的
class SpecialityController extends Controller {
    //城市特产列表
    async cityspes(ctx) {
        let info = apis.CitySpes.Init(ctx);
        await ctx.service.travelService.specialityService.cityspes(info);
        info.submit();
    }

    //我拥有的特产列表
    async myspes(ctx) {
        let info = apis.MySpes.Init(ctx);
        await ctx.service.travelService.specialityService.myspes(info);
        info.submit();
    }

    //购买特产
    async buy(ctx) {
        //买入特产的id 数量
        let info = await apis.BuySpe.Init(ctx, true);
        await ctx.service.travelService.specialityService.buy(info);
        info.submit();
    }
    //卖出特产
    async sell(ctx) {
        //卖出特产的id 数量
        let info = await apis.SellSpe.Init(ctx, true);
        await ctx.service.travelService.specialityService.sell(info);
        info.submit();
    }


}
module.exports = SpecialityController;