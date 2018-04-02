const Controller = require('egg').Controller;

//攻略相关
class StrategyController extends Controller {
    async gettravelstrategy(ctx){
        let info =apis.PostList.Init(ctx);
        let ui = await ctx.service.publicService.userService.findUserBySid(info.sid);
        if(!ui){
            this.logger.info("用户不存在");
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }

        await ctx.service.travelService.strategyService.getTravelStrategy(info,ui);
        info.submit();
    }
}

module.exports = StrategyController;