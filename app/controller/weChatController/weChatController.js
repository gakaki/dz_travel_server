const configDebug = require("../../../debug/debug");

const Controller = require('egg').Controller;
const constant = require("../../utils/constant");
const utils = require("../../utils/utils");
const travelConfig = require("../../../sheets/travel");
const apis = require("../../../apis/travel");
const sheets = require('../../../sheets/travel')

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
        this.logger.info("授权信息" + JSON.stringify(resultS));
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
        const { sid, payCount, goodsId, appName } = ctx.query;
      //  this.logger.info(ctx.query)
        if (!sid || !payCount || !goodsId || !appName) {
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

        let goods = travelConfig.Pay.Get(goodsId);
        if(!goods) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let money = (goods.pay) * 100;
        if (configDebug.WECHATPAY) {
             money = 1;
        }

        this.logger.info("我拿到的钱数:" + money);

        this.logger.info("支付途径");
        ctx.body = await this.service.weChatService.weChatService.minAppPay(ui, money, goodsId, appName);
    }

    wechatsubscriptionpay(ctx) {

    }



    async getgoods(ctx) {
        ctx.body = travelConfig.pays;
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
            "created": new Date().format("yyyy-MM-dd"),
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
        for(let app in constant.AppName){
            if(constant.AppName[app] == appName){
                 this.service.weChatService.weChatService.shopDone(appName);
                let xmlreturn = "<xml><return_code><![CDATA[SUCCESS]]>"
                    + "</return_code><return_msg><![CDATA[OK]]></return_msg></xml>";

                ctx.response.type = 'xml';
                ctx.response.body = xmlreturn;
                return
            }
        }

    }

    async minappreferrer(ctx){
        let result = {};
        const {sid, appName,referrerInfo} = ctx.query;
        if (!sid || !appName ||!referrerInfo) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        this.logger.info("来源记录",referrerInfo);
        let ui = await this.service.publicService.userService.findUserBySid(sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        await this.service.weChatService.weChatService.minAppReferrer(ui, appName,JSON.parse(referrerInfo));
        result.code = constant.Code.OK;
        ctx.body = result;
    }

    async getmockid(ctx) {
        let info = apis.SendMockId.Init(ctx);
        let formId = info.formId;
        let uid = info.uid;
        this.logger.info("获得的formId", formId);
        await this.ctx.model.WeChatModel.TemplateMessage.create({ uid: uid, formId: formId, createDate: new Date() });
        info.submit();

    }

    //公众号token验证
    async wepub(ctx) {
        await this.ctx.service.weChatService.weChatService.wepub(ctx);
    }

    async iosRechargePage(ctx) {
        this.logger.info('access ios recharge page');
        await this.service.weChatService.weChatService.iosRechargePage(ctx);
    }

    async wepubTxt(ctx) {
        await this.service.weChatService.weChatService.wepubTxt(ctx);
    }

    async getsignature(ctx) {
        this.logger.info("获取验证签名");
        const { url } = ctx.query;
        if(!url) {
            let result = {};
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        ctx.body = await this.service.weChatService.weChatService.getsignature(url);
    }

    async wepubpay(ctx) {
        this.logger.info("公众号支付");
        const { uid, goodsId } = ctx.query;
        let result = {};
        if(!uid || !goodsId) {
            this.logger.info("少参数");
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.ctx.model.PublicModel.WepubUser.findOne({ uid: uid });
        if (!ui) {
            this.logger.info("公众号用户未知");
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }

        let goods = travelConfig.Pay.Get(goodsId);
        if(!goods) {
            this.logger.info("未知的商品");
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let money = (goods.pay) * 100;
        if (configDebug.WECHATPAY) {
            money = 1;
        }

        ctx.body = await this.service.weChatService.weChatService.minAppPay(ui, money, goodsId, "travel", "wepubpay");
    }

    async showshop(ctx) {
        let info = apis.Showshop.Init(ctx);
        let show = await this.ctx.model.WeChatModel.ShowShop.findOne({ id: 1 });
        if(!show) {
            await this.ctx.model.WeChatModel.ShowShop.update({ id: 1 }, { $set: { id: 1, show: false } }, { upsert: true });
            show = await this.ctx.model.WeChatModel.ShowShop.findOne({ id: 1 });
        }
        info.isShow = show.show;
        info.submit();
    }


}

module.exports = WeChatController;
