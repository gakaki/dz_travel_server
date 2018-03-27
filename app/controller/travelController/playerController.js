const apis = require("../../../apis/travel");

const Controller = require('egg').Controller;

//玩家个人页相关
class PlayerController extends Controller {
    async showplayerinfo(ctx) {
        let info = apis.PlayerInfo.Init(ctx);
        let userId = info.uid;
        if(info.playerUid){
            userId = info.playerUid;
        }
        let ui = await this.ctx.model.PublicModel.User.findOne({uid: userId});
        if(!ui){
            info.code = apis.Code.USER_NOT_FOUND;
        }else{
            await ctx.service.travelService.playerService.showPlayerInfo(info,ui);
        }

        //send data
        info.submit();
    }


    async setrealinfo(ctx){
        let info = apis.ModifyRealInfo.Init(ctx);
        let ui = ctx.service.PublicService.userService.findUserBySid(info.sid);
        if(!ui){
            info.code = apis.Code.USER_NOT_FOUND;
        }else{
            await ctx.service.travelService.playerService.setRealInfo(info,ui);
        }
        info.submit();
    }

    async getrealinfo(ctx){
        let info = apis.GetRealInfo.Init(ctx);
        let ui = ctx.service.PublicService.userService.findUserBySid(info.sid);
        if(!ui){
            info.code = apis.Code.USER_NOT_FOUND;
        }else{
            await ctx.service.travelService.playerService.getRealInfo(info,ui);
        }
        info.submit();
    }


}