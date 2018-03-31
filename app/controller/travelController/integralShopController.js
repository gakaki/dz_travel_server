const Controller = require('egg').Controller;
const apis = require('../../../apis/travel');

moudle.exports = class IntegralShopController extends Controller {
    async integralshop(ctx) {
        let info = apis.IntegralShop.Init(ctx);
        let ui = await ctx.service.publicService.userService.findUserBySid(info.sid);
        if(!ui){
            this.logger.info("用户不存在");
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }

        await ctx.service.travelService.integralService.getInfo(info, ui);
    }
}
