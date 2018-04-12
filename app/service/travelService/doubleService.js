const Service = require('egg').Service;
const uuid = require("uuid");
const travelConfig = require("../../../sheets/travel");


class DoubleService extends Service {
    async initDoubleFly(info) {
        let invitationCode = uuid.v1();
        let doubleFly = {
            code: invitationCode,
            inviter: info.uid,
            invitee: "0",
            isFly: "0",
        };
        await this.app.redis.hmset(invitationCode, doubleFly);
        await this.app.redis.set(info.uid, invitationCode);
        info.inviteCode = invitationCode;
    }

    async checkCode(info,doubleInfo) {
        //更新用户信息
        await this.app.redis.set(info.uid, info.inviteCode);

        //更新用户要加入的房间信息
        doubleInfo.invitee = info.uid;
        await this.app.redis.hmset(info.inviteCode, doubleInfo);
    }


    async doubleInfo(info, ui, isFly, invitee) {
        let holiday = this.ctx.service.publicService.thirdService.getHoliday();
        if (holiday.length > 0) {
            info.holiday = holiday[0];
        }
        let outw = 1;
        let visit = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: info.uid });
        if(ui) {
            let pvisit = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: ui.uid });
            if(pvisit) {
                info.parLocation = pvisit.cid;
            }
            info.nickName = ui.nickName;
            info.avatarUrl = ui.avatarUrl;
        }

        if (visit) {
            let cid = visit.cid;
            let weather = await this.ctx.service.publicService.thirdService.getWeather(cid);
            for (let we of travelConfig.weathers) {
                if (we.weather == weather) {
                    outw = we.id;
                    break;
                }
            }
            info.location = cid;
            if(isFly && invitee) {
                //上个城市走的实际景点数
                let lastSN = await this.ctx.model.TravelModel.Footprints.count({ uid: info.uid, fid: visit.fid });
                let reward = visit.efficiency * lastSN * travelConfig.Parameter.Get(travelConfig.Parameter.SCOREREWARD).value;
                //上个城市的评分奖励
                let cost = {
                    [ "items." + travelConfig.Item.GOLD]: reward,
                };
                this.ctx.service.publicService.itemService.itemChange(ui.uid, cost);
                await this.ctx.model.TravelModel.CurrentCity.update({ uid: info.uid }, { efficiency: 0 });
                info.score = visit.efficiency;
                info.reward = reward;
            }
        }




        info.gold = info.ui.items[travelConfig.Item.GOLD];
        info.season = await this.ctx.service.publicService.thirdService.getSeason();
        info.weather = outw;
    }

    async deleteCode(info) {
        await this.app.redis.del(info.uid);
        let dInfo = await this.app.redis.hgetall(info.inviteCode);
        if(dInfo && dInfo.code) {
            if(dInfo.invitee == info.uid) {
                dInfo.invitee = "0";
                await this.app.redis.hmset(info.inviteCode, dInfo);
            }
            if(dInfo.inviter == info.uid) {
                this.logger.info("房主离开，code失效");
                await this.app.redis.del(info.inviteCode);
            }
        }
    }

}



module.exports = DoubleService;