'use strict';

const Controller = require('egg').Controller;
const utils=require("./../utils/utils");


class UserController extends Controller {
    async auth(ctx){
        this.logger.info("我要授权");
        console.log(utils.LoginMethod.WECHAT_MINI_APP);
        let sdkAuth={
            payload:ctx.query.payload,
            method:utils.LoginMethod.WECHAT_MINI_APP
        };
        let result={
            data:{}
        };
        let resultS = await this.service.user.auth(sdkAuth);
        if(resultS!=null){
            result.code=0;
            result.data.uid=resultS.openid;
        }else{
            result.code=utils.Code.AUTH_FAILED;
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
            result.code = utils.Code.LOGIN_FAILED;
            ctx.body=result;
            return;
        }
        let rs=await this.service.user.login(ctx.query);
        if(rs.info !=null){
            result.code=0;
            result.data.info=rs.info;
            result.data.sid=rs.sid;
        }else{
            result.code=utils.Code.LOGIN_FAILED;
        }
        ctx.body=result;
    }

    async minapppay(ctx){
        this.logger.info("我要付款");
        let result={};
        let ui=await this.service.user.findUserBySid(ctx.query._sid);
        if(ui==null){
            result.code=utils.Code.USER_NOT_FOUND;
            ctx.body=result;
            return;
        }
        this.logger.info("我拿到的钱数:"+ctx.query.payCount);
        ctx.body=await this.service.user.minAppPay(ui,ctx.query.payCount,ctx.query.title);
    }
    async minappwithdraw(ctx){
        this.logger.info("我要提现");

    }

}

module.exports = UserController;
