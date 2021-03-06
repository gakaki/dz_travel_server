const Controller = require('egg').Controller;
const constant = require("../../utils/constant");


class WeChatController extends Controller {
    async auth(ctx) {
        this.logger.info("我要授权");
        let result = {
            data: {}
        };
        const {payload, appName} = ctx.query;

        if (!payload || !appName) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let sdkAuth = {
            appName: appName,
            payload: payload,
            method: constant.LoginMethod.WECHAT_MINI_APP
        };

        let resultS = await this.service.weChatService.weChatService.auth(sdkAuth);
        if (resultS != null) {
            result.code = 0;
            result.data.uid = resultS.openid;
        } else {
            result.code = constant.Code.AUTH_FAILED;
        }
        ctx.body = result;
    }


    async minapppay(ctx) {
        this.logger.info("我要付款");
        let result = {};
        const {_sid, payCount, title, appName} = ctx.query;
        if (!_sid || !payCount || !title || !appName) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }

        this.logger.info("我拿到的钱数:" + payCount);
        ctx.body = await this.service.weChatService.weChatService.minAppPay(ui, payCount, title, appName);
    }

    async minappwithdraw(ctx) {
        this.logger.info("我要提现");
        let result = {};
        const {_sid, money, appName} = ctx.query;
        if (!_sid || !money || !appName) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }

        let count = await ctx.model.WeChatModel.WechatPaytoUser.count({
            "openid": ui.uid,
            "created": new Date().toLocaleDateString(),
            "success": true,
            appName: appName
        });
        let apps = constant.AppWithdrawCount;
        for (let app in apps) {
            if (app == appName) {
                if (count >= Number(apps[app])) {
                    result.code = constant.Code.EXCEED_COUNT;
                    ctx.body = result;
                    return;
                }
            }
        }
        let res = await this.service.weChatService.weChatService.minAppWithdraw(ui, money, appName);
        if (res) {
            result.code = constant.Code.OK
        } else {
            result.code = constant.Code.NO_MONEY;
        }
        ctx.body = result;

    }

    async shopdone(ctx) {
        this.logger.info("支付成功回调");
        let appName = ctx.url.split("/")[3];
        this.service.weChatService.weChatService.shopDone(appName);
        let xmlreturn = "<xml><return_code><![CDATA[SUCCESS]]>"
            + "</return_code><return_msg><![CDATA[OK]]></return_msg></xml>";

        ctx.res.setHeader('Content-Type', 'application/xml');
        ctx.res.end(xmlreturn);


    }

}

module.exports = WeChatController;
