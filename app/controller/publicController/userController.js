const Controller = require('egg').Controller;

const constant = require("../../utils/constant");


class UserController extends Controller {

    async login(ctx) {
        this.logger.info("我要登陆");


        const {sid, uid,info,appName,shareUid} = ctx.query;
        let result = {
            data: {}
        };
        if ( !info || !appName ||(!sid && !uid )) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let rs = await this.service.publicService.userService.login(uid,sid,appName,shareUid,JSON.parse(info));
    //    ctx.logger.info(rs);
        if (rs.info != null) {
            result.code = 0;
            result.data.info = rs.info;
            result.data.sid = rs.sid;
            result.data.timestamp = Date.now() / 1000;
        } else {
            result.code = constant.Code.LOGIN_FAILED;
        }
        ctx.body = result;
    }

    async getiteminfo(ctx) {
        this.logger.info("我要查询道具");
        let result = {data:{}};
        const {sid, itemId} = ctx.query;
        if (!sid) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        result.code = constant.Code.OK;
        if(itemId){
            result.data.stock = ui.items[itemId];
        }else{
            result.data.stock = ui.items;
        }

        ctx.body = result;

    }

    async changeitem(ctx) {
        const {uid, itemId, count, appName} = ctx.query;
        let result = {};
        if (!uid || !itemId || !count) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await ctx.model.PublicModel.User.findOne({uid: uid,appName:appName});
        if(!ui){
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        let cost = {
            ["items." + itemId]: Number(count)
        };
       // await ctx.model.PublicModel.User.update({uid: uid, appName: appName}, {$inc: cost});

        await this.service.publicService.itemService.itemChange(ui.uid, cost, "artificial");
    }


}

module.exports = UserController;
