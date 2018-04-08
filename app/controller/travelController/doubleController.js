const Controller = require('egg').Controller;
const apis = require("../../../apis/travel");
const utils = require("../../utils/utils");
const travelConfig = require("../../../sheets/travel");
//双人旅行相关
class DoubleController extends Controller {
    async createcode(ctx) {
        let info = await apis.CreateCode.Init(ctx,true);
        if(!info.ui){
            return;
        }
        //判断用户是否已经拥有邀请码
        let code = await this.app.redis.get(info.uid);
        if(code){
            //判断是否是房主
            let dInfo = await this.app.redis.hgetall(code);
            if(dInfo && dInfo.inviteCode){
                //不是房主 不能生成code
                if(dInfo.invitee == info.uid){
                    this.logger.info("已经在房间内了");
                    info.code = apis.Code.ROOM_USER_EXISTS;
                    info.submit();
                    return;
                }
                //是房主 返回原先的code 不再生成新的。
                if(dInfo.inviter == info.uid){
                    info.inviteCode = code;
                    info.submit();
                    return;
                }

            }
        }
        await ctx.service.travelService.doubleService.initDoubleFly(info);
        info.submit();
    }

    async checkcode(ctx){
        let info = await apis.CheckCode.Init(ctx,true);
        if(!info.ui){
            return;
        }
        //查询对应 code 相关信息
        let doubleInfo = await this.app.redis.hgetall(info.inviteCode);
        if(!doubleInfo || !doubleInfo.inviteCode){
            this.logger.info("房间不存在");
            info.code = apis.Code.ROOM_EXPIRED;
            info.submit();
            return;
        }
        //查找用户是否在某个房间里
        let code = await this.app.redis.get(info.uid);
        if(code){
            //用户所在房间与要进的房间一致
            if(code == doubleInfo.inviteCode){
                this.logger.info("已经在房间内了");
                info.code = apis.Code.ROOM_USER_EXISTS;
                info.submit();
                return;
            }else{
                //更新用户已经离开的房间信息
                let dInfo = await this.app.redis.hgetall(code);
                if(dInfo && dInfo.inviteCode){
                    if(dInfo.invitee == info.uid){
                        dInfo.invitee = "0";
                        await this.app.redis.hmset(code,dInfo);
                    }
                    if(dInfo.inviter == info.uid){
                        await this.app.redis.del(code);
                    }
                }
            }
        }

        if(doubleInfo.invitee != "0"){
            this.logger.info("房间已满 ",doubleInfo.invitee);
            info.code = apis.Code.ROOM_FULLED;
            info.submit();
            return;
        }
        await ctx.service.travelService.doubleService.checkCode(info,doubleInfo);

        info.submit();
    }


    async doubleinfo(ctx){
        let info = await apis.PartnerInfo.Init(ctx,true);
        if(!info.ui){
            return;
        }
        let doubleInfo = await this.app.redis.hgetall(info.inviteCode);
        if(!doubleInfo || !doubleInfo.inviteCode){
            info.code = apis.Code.ROOM_EXPIRED;
            info.submit();
            return;
        }
        if(doubleInfo.inviter != info.uid && doubleInfo.invitee != info.ui){
            info.code = apis.Code.ROOM_FULLED;
            info.submit();
            return;
        }

        let userId = info.uid;
        if(doubleInfo.inviter == info.uid){
            userId = doubleInfo.invitee
        }
        if(doubleInfo.invitee == info.uid){
            userId = doubleInfo.inviter;
        }
        let ui = await this.ctx.model.PublicModel.User.findOne({uid: userId});
        await ctx.service.travelService.doubleService.doubleInfo(info,ui);
        info.submit();
    }

    async deletecode(ctx){
        let info = await apis.DeleteCode.Init(ctx,true);
        if(!info.ui){
            return;
        }
        await ctx.service.travelService.doubleService.deleteCode(info);
    }


}
module.exports = DoubleController;