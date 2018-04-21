const Controller = require('egg').Controller;
const apis = require('../../../apis/travel');

module.exports = class IntegralShopController extends Controller {
    async integralshop(ctx) {
        let info = await apis.IntegralShop.Init(ctx, true);

        await ctx.service.travelService.integralService.getInfo(info, info.ui);
        info.submit();
    }

    async exchangedetail(ctx) {
        let info = await apis.ExchangeDetail.Init(ctx, true);

        await ctx.service.travelService.integralService.exchangeDetail(info);
        info.submit();
    }

    async exchangeshop(ctx) {
        let info = await apis.ExchangeShop.Init(ctx, true);

        await ctx.service.travelService.integralService.exchange(info, info.ui);
        info.submit();
    }

    async getuserlocation(ctx) {
        let info = await apis.GetUserLocation.Init(ctx, true);

        await ctx.service.travelService.playerService.getMailAddress(info, info.ui);
        info.submit();
    }

    async initExchangeDetails(ctx) {
        ctx.logger.info('init exchange records')
        await ctx.service.travelService.integralService.initExchangeDetails();
        ctx.body = 'ok'
    }

    async exchangeDeadline(ctx) {
        let info = await apis.ExchangeDeadline.Init(ctx, true);
        await ctx.service.travelService.integralService.exchangeDeadline(info);
        info.submit()
    }
}
