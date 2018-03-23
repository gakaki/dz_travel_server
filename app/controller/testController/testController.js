const Controller = require('egg').Controller;
const constant = require("../../utils/constant");
const englishConfigs = require("../../../sheets/english");

class TestController extends Controller {
   async ranking(ctx){
       let result = {};
       const {uid,rankType} = ctx.query;
       if(!uid || !rankType){
           result.code = constant.Code.PARAMETER_NOT_MATCH;
           ctx.body = result;
           return;
       }
       let player = await ctx.app.redis.hgetall(uid);
       console.log(player);
       if(!player || Number(player.rid)){
           console.log(Number(player.rid));
           result.code = constant.Code.ROOM_EXPIRED;
           ctx.body = result;
           return;
       }
       ctx.service.testService.testService.ranking(uid,rankType);

       result.code=constant.Code.OK;
       ctx.body = result;
   }


    async getmatchinfo(ctx){
      ctx.body = await ctx.service.testService.testService.getMatchInfo();
    }

    async sendanswer(ctx){
        let result = {};
        const {uid} = ctx.query;
        if(!uid){
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let player = await ctx.app.redis.hgetall(uid);
        if(!player || !Number(player.rid)){
            result.code = constant.Code.ROOM_EXPIRED;
            ctx.body = result;
            return;
        }
        ctx.service.testService.testService.sendAnswer(player);

        result.code=constant.Code.OK;
        ctx.body = result;
    }

}

module.exports = TestController;
