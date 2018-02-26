'use strict';

const Controller = require('egg').Controller;
const constant=require("../../utils/constant");


class weSrvController extends Controller {
    async sendpack(ctx){
        ctx.logger.info("我要发红包");
        let result={
            data:{}
        };
        const {_sid,money,title,useTicket,orderId}=ctx.query;
        if(!_sid || !money || !title || !useTicket){
            result.code=constant.Code.PARAMETER_NOT_MATCH;
            ctx.body=result;
            return;
        }

        let ui=await this.service.user.findUserBySid(_sid);
        if(ui==null){
            result.code=constant.Code.USER_NOT_FOUND;
            ctx.body=result;
            return;
        }
        if(orderId){
            let pack=await ctx.model.WeSrvModel.PackInfo.findOne({"orderId":orderId});
            if(pack !=null){
                pack.userInfo=ui;
               result.code=constant.Code.OK;
               result.data=pack;
            }else{
                result.code=constant.Code.PACK_EMPTY;
            }
        }else{
            let resultP = await this.service.weSrv.sendPack(ui,money,title,useTicket);
            if(resultP.packInfo!=null){
                result.code=constant.Code.OK;
                result.data=resultP.packInfo;
            }else{
                result.code=resultP.status;
            }

        }
        ctx.body=result;
    }
    async guesspack(ctx){
        ctx.logger.info("我要竞猜数字");
        let result={
            data:{}
        };
        const {_sid,pid,guessNum}=ctx.query;
        if(!_sid || !pid|| !guessNum){
            result.code=constant.Code.PARAMETER_NOT_MATCH;
            ctx.body=result;
            return;
        }
        let ui=await this.service.user.findUserBySid(_sid);
        if(ui==null){
            result.code=constant.Code.USER_NOT_FOUND;
            ctx.body=result;
            return;
        }
        let pack=await ctx.model.WeSrvModel.PackInfo.findOne({pid:pid});
        if(pack==null){
            result.code=constant.Code.PACK_EMPTY;
            ctx.body=result;
            return
        }

       ctx.body=await this.service.weSrvService.weSrv.guessPack(ui,pack,guessNum,_sid);
    }

    async clearcd(ctx){
        ctx.logger.info("我要消除等待CD");
        let result={
            data:{}
        };
        const {_sid,pid}=ctx.query;
        if(!_sid||!pid){
            result.code=constant.Code.PARAMETER_NOT_MATCH;
            ctx.body=result;
            return;
        }
        let ui=await this.service.publicService.user.findUserBySid(_sid);
        if(ui==null){
            result.code=constant.Code.USER_NOT_FOUND;
            ctx.body=result;
            return;
        }
        let pack=await ctx.model.WeSrvModel.PackInfo.findOne({pid:pid});
        if(pack==null){
            result.code=constant.Code.PACK_EMPTY;
            ctx.body=result;
            return
        }
        ctx.body=await this.service.weSrvService.weSrv.clearCD(ui,pack,_sid);
    }

    async getpackrecords(ctx){
        ctx.logger.info("我要获取红包竞猜记录");
        let result={
            data:{}
        };
        const {_sid,pid}=ctx.query;
        if(!_sid||!pid){
            result.code=constant.Code.PARAMETER_NOT_MATCH;
            ctx.body=result;
            return;
        }
        let ui=await this.service.publicService.user.findUserBySid(_sid);
        if(ui==null){
            result.code=constant.Code.USER_NOT_FOUND;
            ctx.body=result;
            return;
        }
        let pack=await ctx.model.WeSrvModel.PackInfo.findOne({pid:pid});
        if(pack==null){
            result.code=constant.Code.PACK_EMPTY;
            ctx.body=result;
            return
        }
        ctx.body=await this.service.weSrvService.weSrv.getPackRecords(ui,pack);
    }

    async getpackrankinglist(ctx){
        ctx.logger.info("我要获取红包竞猜排行榜");
        let result={};
        const {_sid,pid}=ctx.query;
        if(!_sid||!pid){
            result.code=constant.Code.PARAMETER_NOT_MATCH;
            ctx.body=result;
            return;
        }
        let ui=await this.service.publicService.user.findUserBySid(_sid);
        if(ui==null){
            result.code=constant.Code.USER_NOT_FOUND;
            ctx.body=result;
            return;
        }
        let pack=await ctx.model.WeSrvModel.PackInfo.findOne({pid:pid});
        if(pack==null){
            result.code=constant.Code.PACK_EMPTY;
            ctx.body=result;
            return
        }
        ctx.body=await this.service.weSrvService.weSrv.getPackRankingList(ui,pack);
    }

    async getuserpackrecords(ctx){
        ctx.logger.info("获取用户收发红包记录");
        let result={};
        const {_sid,sendPage,sendLimit,receivePage,receiveLimit}=ctx.query;
        if(!_sid){
            result.code=constant.Code.PARAMETER_NOT_MATCH;
            ctx.body=result;
            return;
        }
        let ui=await this.service.publicService.user.findUserBySid(_sid);
        if(ui==null){
            result.code=constant.Code.USER_NOT_FOUND;
            ctx.body=result;
            return;
        }
        /*let ui={
            uid:"123"
        }*/

        let sendPageN = sendPage || 1;
        let sendLimitN = sendLimit || 20;
        let receivePageN = receivePage || 1;
        let receiveLimitN = receiveLimit || 20;

        ctx.body=await this.service.weSrvService.weSrv.getUserPackRecords(ui,Number(sendPageN),Number(sendLimitN),Number(receivePageN),Number(receiveLimitN));
    }
    async getacceleration(ctx){
        ctx.logger.info("获取加速卡");
        let result={};
        const {_sid}=ctx.query;
        if(!_sid){
            result.code=constant.Code.PARAMETER_NOT_MATCH;
            ctx.body=result;
            return;
        }
        let ui=await this.service.publicService.user.findUserBySid(_sid);
        if(ui==null){
            result.code=constant.Code.USER_NOT_FOUND;
            ctx.body=result;
            return;
        }
        ctx.body=await this.service.weSrvService.weSrv.getAcceleration(ui);
    }
}

module.exports = weSrvController;
