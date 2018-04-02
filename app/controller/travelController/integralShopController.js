const Controller = require('egg').Controller;
const apis = require('../../../apis/travel');

module.exports = class IntegralShopController extends Controller {
    async integralshop(ctx) {
        let info = apis.IntegralShop.Init(ctx, true);
        if (!info.ui){
            return;
        }

        await ctx.service.travelService.integralService.getInfo(info, info.ui);

        info.submit();
    }

    async exchangeshop(ctx) {
        let info = apis.ExchangeShop.Init(ctx, true);
        if (!info.ui){
            return;
        }

        await ctx.service.travelService.integralService.exchange(info, info.ui);
    }
}
