const Controller = require('egg').Controller;
const apis = require('../../../apis/travel');
const travelConfig = require("../../../sheets/travel");

//旅行出发相关
class TravelController extends Controller {
    async index(ctx) {
        let info = apis.IndexInfo.Init(ctx);
        let ui = await ctx.service.publicService.userService.findUserBySid(info.sid);
        if (!ui) {
            this.logger.info("用户不存在");
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }

        await this.service.travelService.travelService.fillIndexInfo(info, ui);
        //send data
        info.submit();
    }

    //选择城市
    async selectcity(ctx) {
        let info = apis.FlyInfo.Init(ctx);
        let ui = await ctx.service.publicService.userService.findUserBySid(info.sid);
        this.logger.info("选择城市");
        if (!ui) {
            this.logger.info("用户不存在");
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }
        await this.service.travelService.travelService.selectCity(info, ui);

        info.submit();
    }

    async visit(ctx) {
        let info = apis.StartGame.Init(ctx);
        let ui = await ctx.service.publicService.userService.findUserBySid(info.sid);
        this.logger.info("访问城市");
        //用户不存在
        if (!ui) {
            this.logger.info("用户不存在");
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return
        }

        let fid = null;
        let fui = null;


        //非法传参
        if (!Number(info.cost)) {
            if (Number(info.cost) != 0) {
                this.logger.info("非法传参");
                info.code = apis.Code.PARAMETER_NOT_MATCH;
                info.submit();
                return;
            }

        }

        //金币不足
        if (!ui.isFirst) {
            if (ui.items[travelConfig.Item.GOLD] <= 0 || ui.items[travelConfig.Item.GOLD] < Number(info.cost)) {
                this.logger.info("金币不足");
                info.code = apis.Code.NEED_ITEMS;
                info.submit();
                return
            }
        }

        //城市不存在
        if (!travelConfig.City.Get(info.cid)) {
            this.logger.info("城市不存在");
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            info.submit();
            return
        }
        let currentCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: ui.uid });
        //道具不足
        if (info.type == apis.TicketType.SINGLEPRESENT || info.type == apis.TicketType.DOUBLEPRESENT) {
            let ticket = await this.ctx.model.TravelModel.FlyTicket.findOne({ uid: ui.uid, id: info.tid });
            if (!ticket || ticket.isUse) {
                this.logger.info("道具不存在或者已使用");
                info.code = apis.Code.NOT_FOUND;
                info.submit();
                return
            }
        }
        if(currentCity) {
            if (currentCity.cid == info.cid) {
                this.logger.info("已经在当前城市了 ：" + info.cid);
                info.code = apis.Code.REQUIREMENT_FAILED;
                info.submit();
                return
            }

        }
        if (info.inviteCode) {
            let dInfo = await this.app.redis.hgetall(info.inviteCode);
            if(!dInfo || !dInfo.code) {
                this.logger.info("房间不存在");
                info.code = apis.Code.ROOM_EXPIRED;
                info.submit();
                return
            }
            if (dInfo.invitee == "0") {
                this.logger.info("房间未满");
                info.code = apis.Code.FRIEND_WAIT;
                info.submit();
                return
            }
            dInfo = await this.app.redis.hgetall(info.inviteCode);
            dInfo.isFly = 1;
            await this.app.redis.hmset(info.inviteCode, dInfo);
            fid = dInfo.invitee;
            fui = await this.ctx.model.PublicModel.User.findOne({uid: fid});
            if(!fui) {
                this.logger.info("好友不存在");
                info.code = apis.Code.USER_NOT_FOUND;
                info.submit();
                return
            }

        }
        this.logger.info("飞机起飞喽   ", info.inviteCode);
        this.logger.info(fid);

        await this.service.travelService.travelService.visit(info, ui, currentCity, fui);

        info.submit();
    }


    async gettravellog(ctx) {
        let info = apis.TravelLog.Init(ctx);
        let userId = info.uid;
        if (info.playerUid) {
            userId = info.playerUid
        }
        let ui = await this.ctx.model.PublicModel.User.findOne({uid: userId});
        if (!ui) {
            this.logger.info("用户不存在");
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }
        await ctx.service.travelService.travelService.getTravelLog(info, ui);
        info.submit();

    }

    async getcitycompletionlist(ctx) {
        let info = apis.CityListPer.Init(ctx);
        let ui = await ctx.service.publicService.userService.findUserBySid(info.sid);
        if (!ui) {
            this.logger.info("用户不存在");
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }
        await ctx.service.travelService.travelService.getCityCompletionList(info, ui);
        info.submit();
    }


}

module.exports = TravelController;