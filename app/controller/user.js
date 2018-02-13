'use strict';

const Controller = require('egg').Controller;
const utils=require("./../utils/utils");
const constant=require("./../utils/constant");
const configs=require('./../../config/configs');


class UserController extends Controller {
    async auth(ctx){
        this.logger.info("我要授权");
        let result={
            data:{}
        };
        if(!ctx.query.payload){
            result.code=constant.Code.PARAMETER_NOT_MATCH;
            ctx.body=result;
            return;
        }
        let sdkAuth={
            payload:ctx.query.payload,
            method:constant.LoginMethod.WECHAT_MINI_APP
        };

        let resultS = await this.service.user.auth(sdkAuth);
        if(resultS!=null){
            result.code=0;
            result.data.uid=resultS.openid;
        }else{
            result.code=constant.Code.AUTH_FAILED;
        }
        ctx.body=result;
    }
    async login(ctx) {
        this.logger.info("我要登陆");
        let sid=ctx.query._sid;
        let uid=ctx.query.uid;
        let result={
            data:{}
        };
        if(!sid && !uid){
            result.code = constant.Code.LOGIN_FAILED;
            ctx.body=result;
            return;
        }
        let rs=await this.service.user.login(ctx.query);
        if(rs.info !=null){
            result.code=0;
            result.data.info=rs.info;
            result.data.sid=rs.sid;
        }else{
            result.code=constant.Code.LOGIN_FAILED;
        }
        ctx.body=result;
    }

    async getiteminfo(ctx){
        this.logger.info("我要查询道具");
        let result={
            data:{}
        };
        if(!ctx.query._sid||!ctx.query.itemId){
            result.code=constant.Code.PARAMETER_NOT_MATCH;
            ctx.body=result;
            return;
        }
        let ui=await this.service.user.findUserBySid(ctx.query._sid);
        if(ui==null){
            result.code=constant.Code.USER_NOT_FOUND;
            ctx.body=result;
            return;
        }
        result.code=constant.Code.OK;
        result.data.stock=ui.items[ctx.query.itemId];
        ctx.body=result;

    }

    async minapppay(ctx){
        this.logger.info("我要付款");
        let result={};
        if(!ctx.query._sid||!ctx.query.payCount||!ctx.query.title){
            result.code=constant.Code.PARAMETER_NOT_MATCH;
            ctx.body=result;
            return;
        }
        let ui=await this.service.user.findUserBySid(ctx.query._sid);
        if(ui==null){
            result.code=constant.Code.USER_NOT_FOUND;
            ctx.body=result;
            return;
        }

        this.logger.info("我拿到的钱数:"+ctx.query.payCount);
        ctx.body=await this.service.user.minAppPay(ui,ctx.query.payCount,ctx.query.title);
    }
    async minappwithdraw(ctx){
        this.logger.info("我要提现");
        let result={};
        if(!ctx.query._sid||!ctx.query.money){
            result.code=constant.Code.PARAMETER_NOT_MATCH;
            ctx.body=result;
            return;
        }
        let ui=await this.service.user.findUserBySid(ctx.query._sid);
        if(ui==null){
            result.code=constant.Code.USER_NOT_FOUND;
            ctx.body=result;
            return;
        }

        let count=await ctx.model.WechatPaytoUser.count({"openid":ui.uid,"created":new Date().toLocaleDateString(),"success":true});
        if(count>=Number(configs.configs().Parameter.Get("withdrawalsnum").value)){
            result.code=constant.Code.EXCEED_COUNT;
            ctx.body=result;
            return;
        }
        let res=await this.service.user.minAppWithdraw(ui,ctx.query.money);
        if(res){
            result.code=constant.Code.OK
        }else{
            result.code=constant.Code.NO_MONEY;
        }
        ctx.body=result;

    }

    async shopdone(ctx){
        this.logger.info("支付成功回调");
        this.service.user.shopDone();
            let xmlreturn = "<xml><return_code><![CDATA[SUCCESS]]>"
                + "</return_code><return_msg><![CDATA[OK]]></return_msg></xml>";

        ctx.res.setHeader('Content-Type', 'application/xml');
        ctx.res.end(xmlreturn);


    }

    async changeitem(ctx){
        let uid=ctx.query.uid;
        let itemId=ctx.query.itemId;
        let count=ctx.query.count;
        let result={};
        if(!uid||!itemId||!count){
            result.code=constant.Code.PARAMETER_NOT_MATCH;
            ctx.body=result;
            return;
        }
        let cost={
            ["items."+itemId]:Number(count)
        };
        await this.ctx.model.User.update({uid:uid},{$inc:cost});
        let ui=await this.ctx.model.User.findOne({uid:uid});
        await this.ctx.service.item.itemChange(ui,cost);
    }

}

module.exports = UserController;
