'use strict';

const Controller = require('egg').Controller;
const utils=require("./../utils/utils");


class GuessnumController extends Controller {
    async sendpack(ctx){
        ctx.logger.info("我要发红包");
        let result={
            data:{}
        };
        let ui=await this.service.user.findUserBySid(ctx.query._sid);
        if(ui==null){
            result.code=utils.Code.USER_NOT_FOUND;
            ctx.body=result;
            return;
        }
        if(ctx.query.orderId){
            let pack=await ctx.model.PackInfo.findOne({"orderId":ctx.query.orderId});
            if(pack !=null){
                pack.userInfo=ui;
               result.code=0;
               result.data=pack;
            }else{
                result.code=utils.Code.PACK_EMPTY;
            }
        }else{
            let resultP = await this.service.guessnum.sendPack(ui,ctx.query.money,ctx.query.title,ctx.query.useTicket);
            if(resultP.packInfo!=null){
                result.code=0;
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
        let ui=await this.service.user.findUserBySid(ctx.query._sid);
        if(ui==null){
            result.code=utils.Code.USER_NOT_FOUND;
            ctx.body=result;
            return;
        }
        let pack=await ctx.model.PackInfo.findOne({pid:ctx.query.pid});
        if(pack==null){
            result.code=utils.Code.PACK_EMPTY;
            ctx.body=result;
            return
        }

       ctx.body=await this.service.guessnum.guessPack(ui,pack,ctx.query.guessNum,ctx.query._sid);
    }

    async clearcd(ctx){
        ctx.logger.info("我要消除等待CD");
        let result={
            data:{}
        };
        let ui=await this.service.user.findUserBySid(ctx.query._sid);
        if(ui==null){
            result.code=utils.Code.USER_NOT_FOUND;
            ctx.body=result;
            return;
        }
        let pack=await ctx.model.PackInfo.findOne({pid:ctx.query.pid});
        if(pack==null){
            result.code=utils.Code.PACK_EMPTY;
            ctx.body=result;
            return
        }
        ctx.body=await this.service.guessnum.clearCD(ui,pack,ctx.query._sid);
    }

    async getpackrecords(ctx){
        ctx.logger.info("我要获取红包竞猜记录");
        let result={
            data:{}
        };
        let ui=await this.service.user.findUserBySid(ctx.query._sid);
        if(ui==null){
            result.code=utils.Code.USER_NOT_FOUND;
            ctx.body=result;
            return;
        }
        let pack=await ctx.model.PackInfo.findOne({pid:ctx.query.pid});
        if(pack==null){
            result.code=utils.Code.PACK_EMPTY;
            ctx.body=result;
            return
        }
        ctx.body=await this.service.guessnum.getPackRecords(ui,pack);
    }

    async getpackrankinglist(ctx){
        ctx.logger.info("我要获取红包竞猜排行榜");
        let result={};
        let ui=await this.service.user.findUserBySid(ctx.query._sid);
        if(ui==null){
            result.code=utils.Code.USER_NOT_FOUND;
            ctx.body=result;
            return;
        }
        let pack=await ctx.model.PackInfo.findOne({pid:ctx.query.pid});
        if(pack==null){
            result.code=utils.Code.PACK_EMPTY;
            ctx.body=result;
            return
        }
        ctx.body=await this.service.guessnum.getPackRankingList(ui,pack);
    }

    async getuserpackrecords(ctx){
        ctx.logger.info("获取用户收发红包记录");
        let result={};
        let ui=await this.service.user.findUserBySid(ctx.query._sid);
        if(ui==null){
            result.code=utils.Code.USER_NOT_FOUND;
            ctx.body=result;
            return;
        }

        let sendPage = ctx.query.sendPage || 1;
        let sendLimit = ctx.query.sendLimit || 20;
        let receivePage = ctx.query.receivePage || 1;
        let receiveLimit = ctx.query.receiveLimit || 20;

        ctx.body=await this.service.guessnum.getUserPackRecords(ui,Number(sendPage),Number(sendLimit),Number(receivePage),Number(receiveLimit));
    }
    async getacceleration(ctx){
        ctx.logger.info("获取加速卡");
        let result={};
        let ui=await this.service.user.findUserBySid(ctx.query._sid);
        if(ui==null){
            result.code=utils.Code.USER_NOT_FOUND;
            ctx.body=result;
            return;
        }
        ctx.body=await this.service.guessnum.getAcceleration(ui);
    }
}

module.exports = GuessnumController;
