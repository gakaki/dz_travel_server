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
        this.logger.info("邀请码 "+ code);
        if(code){
            //判断是否是房主
            let dInfo = await this.app.redis.hgetall(code);
            this.logger.info("邀请信息 " , dInfo);
            if(dInfo && dInfo.code){
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

    async checkcode(ctx) {
        let info = await apis.CheckCode.Init(ctx,true);
        if(!info.ui) {
            return;
        }
        this.logger.info("传入的邀请码 " + info.inviteCode);
        //查询对应 code 相关信息
        let doubleInfo = await this.app.redis.hgetall(info.inviteCode);
        this.logger.info("房间信息 ", doubleInfo);
        if(!doubleInfo || !doubleInfo.code) {
            this.logger.info("房间不存在");
            info.code = apis.Code.ROOM_EXPIRED;
            info.submit();
            return;
        }
        //查找用户是否在某个房间里
        let code = await this.app.redis.get(info.uid);
        if(code) {
            //用户所在房间与要进的房间一致
            if(code == doubleInfo.code) {
                this.logger.info("已经在房间内了");
                info.code = apis.Code.ROOM_USER_EXISTS;
                info.submit();
                return;
            }else{
                //更新用户已经离开的房间信息
                let dInfo = await this.app.redis.hgetall(code);
                if(dInfo && dInfo.code) {
                    if(dInfo.invitee == info.uid) {
                        dInfo.invitee = "0";
                        await this.app.redis.hmset(code, dInfo);
                    }
                    if(dInfo.inviter == info.uid) {
                        await this.app.redis.del(code);
                    }
                }
            }
        }

        if(doubleInfo.invitee != "0"){
            this.logger.info("check房间已满 ",doubleInfo.invitee);
            info.code = apis.Code.ROOM_FULLED;
            info.submit();
            return;
        }

        if(!info.agree) {
            let lastCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: info.uid });
            if(lastCity) {
                info.code = apis.Code.ISTRAVELLING;
                info.submit();
                return;
            }
        }

        await ctx.service.travelService.doubleService.checkCode(info, doubleInfo);

        info.submit();
    }


    async doubleinfo(ctx) {
        let info = await apis.PartnerInfo.Init(ctx,true);
        if(!info.ui) {
            return;
        }
        let doubleInfo = await this.app.redis.hgetall(info.inviteCode);
        this.logger.info("传入的code " + info.inviteCode);
        this.logger.info("房间信息 ", doubleInfo);
        if(!doubleInfo || !doubleInfo.code) {
            info.code = apis.Code.ROOM_EXPIRED;
            info.submit();
            return;
        }
        if(doubleInfo.inviter != info.uid && doubleInfo.invitee != info.uid) {
            this.logger.info("接口轮询 房间已满 " + info.uid, doubleInfo.inviter, doubleInfo.invitee != info.uid, doubleInfo.invitee);
            info.code = apis.Code.ROOM_FULLED;
            info.submit();
            return;
        }

        let userId = info.uid;
        if(doubleInfo.inviter == info.uid) {
            userId = doubleInfo.invitee
        }
        if(doubleInfo.invitee == info.uid) {
            userId = doubleInfo.inviter;
        }
        let isFly = Number(doubleInfo.isFly);
        info.isFly = isFly;
        let invitee = false;
        if(isFly) {
            if(info.uid == doubleInfo.invitee) {
                invitee = true;
            }
        }
        let ui = await this.ctx.model.PublicModel.User.findOne({ uid: userId });
        this.logger.info("哪位大大轮询的 " + info.uid);
        this.logger.info("等待的同伴信息 " + userId, ui);
        await ctx.service.travelService.doubleService.doubleInfo(info, ui, isFly, invitee);
        info.submit();
    }

    async deletecode(ctx) {
        let info = await apis.DeleteCode.Init(ctx, true);
        if(!info.ui) {
            return;
        }
        this.logger.info("删除邀请码 " + info.inviteCode);
        await ctx.service.travelService.doubleService.deleteCode(info);
        info.submit();
    }


}
module.exports = DoubleController;