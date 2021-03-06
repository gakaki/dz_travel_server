const Controller = require('egg').Controller;

const constant = require("../../utils/constant");


class UserController extends Controller {

    async login(ctx) {
        this.logger.info("我要登陆");

        const {sid, uid} = ctx.query;
        let result = {
            data: {}
        };
        if (!sid && !uid) {
            result.code = constant.Code.LOGIN_FAILED;
            ctx.body = result;
            return;
        }
        let rs = await this.service.publicService.userService.login(ctx.query);
        if (rs.info != null) {
            result.code = 0;
            result.data.info = rs.info;
            result.data.sid = rs.sid;
        } else {
            result.code = constant.Code.LOGIN_FAILED;
        }
        ctx.body = result;
    }

    async getiteminfo(ctx) {
        this.logger.info("我要查询道具");
        let result = {
            data: {}
        };
        const {_sid, itemId} = ctx.query;
        if (!_sid || !itemId) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(ctx.query._sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        result.code = constant.Code.OK;
        result.data.stock = ui.items[ctx.query.itemId];
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
        let cost = {
            ["items." + itemId]: Number(count)
        };
        await this.ctx.model.PublicModel.User.update({uid: uid, appName: appName}, {$inc: cost});
        let ui = await this.ctx.model.PublicModel.User.findOne({uid: uid});
        await this.ctx.service.publicService.itemService.itemChange(ui, cost, appName);
    }

}

module.exports = UserController;
