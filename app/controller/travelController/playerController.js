const Controller = require('egg').Controller;
const apis = require("../../../apis/travel");
const utils = require("../../utils/utils");
const travelConfig = require("../../../sheets/travel");
//玩家个人页相关
class PlayerController extends Controller {
    async showplayerinfo(ctx) {
        let info = apis.PlayerInfo.Init(ctx);
        let userId = info.uid;
        if(info.playerUid) {
            userId = info.playerUid;
        }
        let ui = await this.ctx.model.PublicModel.User.findOne({ uid: userId });
        if(!ui) {
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }
        await ctx.service.travelService.playerService.showPlayerInfo(info, ui);
        //send data
        info.submit();
    }

    async travelfootprint(ctx){
        let info = apis.TravelFootprint.Init(ctx);
        let userId = info.uid;
        if(info.playerUid){
            userId = info.playerUid;
        }
        let ui = await this.ctx.model.PublicModel.User.findOne({uid: userId});
        if(!ui){
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }
        await ctx.service.travelService.playerService.travelFootprint(info,ui);
        //send data
        info.submit();
    }

    async showflyticket(ctx){
        let info = apis.LookTicket.Init(ctx);
        let ui = await ctx.service.publicService.userService.findUserBySid(info.sid);
        if(!ui){
            this.logger.info("用户不存在");
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }
        await ctx.service.travelService.playerService.showFlyTicket(info,ui);

        info.submit();
    }


    async getmessage(ctx){
        let info = apis.GetMessage.Init(ctx);
        let ui = await ctx.service.publicService.userService.findUserBySid(info.sid);
        if(!ui){
            this.logger.info("用户不存在");
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }
        let mtype = info.messageType;
        if(mtype){
            ctx.logger.info("接收到的消息类型 "+ typeof mtype , mtype);
            if(mtype.constructor !== Array){
                info.code = apis.Code.PARAMETER_NOT_MATCH;
                return;
            }
        }
        await ctx.service.travelService.playerService.getMessage(info,ui,mtype);

        info.submit();
    }

    async clearmsg(ctx){
        let info = apis.ClearMsg.Init(ctx);
        let ui = await ctx.service.publicService.userService.findUserBySid(info.sid);
        if(!ui){
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }
        let msg = await this.ctx.service.travelService.msgService.readMsg(info.mid);
        if(!msg){
            info.code = apis.Code.NOT_FOUND;
            info.submit();
            return;
        }
        this.logger.info("清除已读信息");
        await ctx.service.travelService.playerService.clearMsg(info,ui,msg);

        info.submit();
    }


    async checkmsgcnt(ctx){
        let info = apis.CheckMsgCnt.Init(ctx);
        let ui = await ctx.service.publicService.userService.findUserBySid(info.sid);
        if(!ui){
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }
        await ctx.service.travelService.playerService.checkMsgCnt(info,ui);
        info.submit();
    }

    async setrealinfo(ctx){
        let info = apis.ModifyRealInfo.Init(ctx);
        let ui = await ctx.service.publicService.userService.findUserBySid(info.sid);
        if(!ui){
            this.logger.info("用户不存在");
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }
        this.logger.info("用户信息 ：名字 "+info.name +" 生日 ："+info.birthday+" 电话号码 ："+info.phone +" 地址： "+info.address );
        if(!info.name || !info.birthday || !info.phone || !info.address){
            this.logger.info("用户信息不全");
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            info.submit();
            return;
        }
        await ctx.service.travelService.playerService.setRealInfo(info,ui);

        info.submit();
    }

    async getrealinfo(ctx){
        let info = apis.GetRealInfo.Init(ctx);
        let ui = await ctx.service.publicService.userService.findUserBySid(info.sid);
        if(!ui){
            this.logger.info("用户不存在");
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }

        await ctx.service.travelService.playerService.getRealInfo(info,ui);

        info.submit();
    }

    async showmypostcards(ctx){
        let info = apis.MyPostcards.Init(ctx);
        let userId = info.uid;
        if(info.playerUid){
            userId = info.playerUid;
        }
        let ui = await this.ctx.model.PublicModel.User.findOne({uid: userId});
        if(!ui){
            this.logger.info("用户不存在");
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }

        await ctx.service.travelService.playerService.showMyPostcards(info,ui);
        info.submit();

    }

    async showcitypostcards(ctx){
        let info =apis.CityPostcards.Init(ctx);
        let userId = info.uid;
        if(info.playerUid){
            userId = info.playerUid;
        }
        let ui = await this.ctx.model.PublicModel.User.findOne({uid: userId});
        if(!ui){
            this.logger.info("用户不存在");
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }
        await ctx.service.travelService.playerService.showCityPostcards(info,ui);
        info.submit();
    }

    async showdetailpostcard(ctx){
        let info =apis.DetailPostcard.Init(ctx);
        let ui = await ctx.service.publicService.userService.findUserBySid(info.sid);
        if(!ui){
            this.logger.info("用户不存在");
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }
        await ctx.service.travelService.playerService.showDetailPostcard(info,ui);
        info.submit();
    }

    async sendpostcard(ctx){
        let info =apis.SendPostcard.Init(ctx);
        let ui = await ctx.service.publicService.userService.findUserBySid(info.sid);
        if(!ui){
            this.logger.info("用户不存在");
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }
        let postcard = await ctx.model.TravelModel.Postcard.findOne({pscid:info.id});
        if(!postcard){
            this.logger.info("明信片不存在");
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            info.submit();
            return;
        }
        if(!info.message){
            this.logger.info("留言信息为空");
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            info.submit();
            return;
        }

        if(info.message.length > travelConfig.Parameter.Get(travelConfig.Parameter.POSTCARDWORDLIMIT).value){
            this.logger.info("留言信息字数超限");
            info.code = apis.Code.ITEM_MAX;
            info.submit();
            return
        }

        await ctx.service.travelService.playerService.sendPostcardMsg(info,ui,postcard);
        info.submit();
    }

    async signinfo(ctx){
        let info =apis.SignInfo.Init(ctx);
        let ui = await ctx.service.publicService.userService.findUserBySid(info.sid);
        if(!ui){
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }
        await ctx.service.travelService.playerService.signInfo(info,ui);
        info.submit();
    }

    async tosign(ctx){
        let info =apis.ToSign.Init(ctx);
        let ui = await ctx.service.publicService.userService.findUserBySid(info.sid);
        if(!ui){
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }
        let signCount = await ctx.model.PublicModel.SignInRecord.count({
            uid: ui.uid,
            createDate: new Date().format("yyyy-MM-dd")
        });
        if (signCount) {
            info.code = apis.Code.HAS_SIGNIN;
            info.submit();
            return;
        }
        await ctx.service.travelService.playerService.toSign(info,ui);
        info.submit();
    }


    async getrankinfo(ctx) {
        let info = await apis.RankInfo.Init(ctx, true);
        if(!info.ui) {
            return;
        }
        if(info.rankType != apis.RankType.THUMBS && info.rankType != apis.RankType.FOOT && info.rankType != apis.RankType.SCORE){
            this.logger.info("榜单类型错误 " + info.rankType);
            info.code = apis.Code.NOT_FOUND;
            info.submit();
            return;
        }


        if(info.rankSubtype != apis.RankSubtype.COUNTRY && info.rankSubtype != apis.RankSubtype.FRIEND){
            this.logger.info("榜单子类型错误 " + info.rankSubtype);
            info.code = apis.Code.NOT_FOUND;
            info.submit();
            return;
        }

       // await ctx.service.travelService.rankService.updateScoreRankList();
        await ctx.service.travelService.playerService.getRankInfo(info);
        info.submit();



    }

    async shareInfo(ctx) {
        let info = await apis.ShareInfo.Init(ctx, true);
        await ctx.service.travelService.playerService.shareInfo(info);
        info.submit();
    }


}
module.exports = PlayerController;