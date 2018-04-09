// app/middleware/routerUserInfo.js
// controller 之前调用 若有提供uid的那么给ctx userinfo赋值 否则直接返回不让访问
const apis = require('../../apis/travel');

module.exports = options => {
    return async function routerUserInfo(ctx, next) {

        let res         = ctx.query;
        let userId      = res['sid'] || res['uid'];

        if (!userId) {
            ctx.body = { data: {}, code: apis.Code.USER_NOT_FOUND };
            return ctx.body;
        }


        let ui  = await ctx.service.publicService.userService.findUserBySid(userId);
        if (!ui) {
            ctx.logger.info("用户不存在");
            ctx.body = { data: {}, code: apis.Code.USER_NOT_FOUND };
            return ctx.zbody;
        }
        else {
            ctx.session.ui  = ui;
            // ctx.session.sid = res.sid;
        }
        
        await next();
    };
};
