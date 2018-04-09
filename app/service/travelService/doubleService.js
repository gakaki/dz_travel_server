const Service = require('egg').Service;
const uuid = require("uuid");
const travelConfig = require("../../../sheets/travel");


class DoubleService extends Service {
    async initDoubleFly(info){
        let invitationCode = uuid.v1();
        let doubleFly ={
            code:invitationCode,
            inviter:info.uid,
            invitee:"0",
            isFly:"0"
        };
        await this.app.redis.hmset(invitationCode,doubleFly);
        await this.app.redis.set(info.uid,invitationCode);
        info.inviteCode =  invitationCode;
    }

    async checkCode(info,doubleInfo){
        //更新用户信息
        await this.app.redis.set(info.uid,info.inviteCode);

        //更新用户要加入的房间信息
        doubleInfo.invitee = info.uid;
        await this.app.redis.hmset(info.inviteCode,doubleInfo);
    }


    async doubleInfo(info,ui){
        let holiday = this.ctx.service.publicService.thirdService.getHoliday();
        if (holiday.length > 0) {
            info.holiday = holiday[0];
        }
        let outw = 1;
        let visit = await this.ctx.model.TravelModel.CurrentCity.findOne({uid: info.uid});
        let pvisit = await this.ctx.model.TravelModel.CurrentCity.findOne({uid: ui.uid});
        if (visit) {
            let cid = visit.cid;
            let weather = await this.ctx.service.publicService.thirdService.getWeather(travelConfig.City.Get(cid).city);
            for (let we of travelConfig.weathers) {
                if (we.weather == weather) {
                    outw = we.id;
                    break;
                }
            }
            info.location = cid;
        }
        if(pvisit){
            info.parLocation = visit.cid;
        }
        info.nickName = ui.nickName;
        info.avatarUrl = ui.avatarUrl;

        info.gold = info.ui.items[travelConfig.Item.Gold];
        info.season = await this.ctx.service.publicService.thirdService.getSeason();
        info.weather = outw;
    }

    async deleteCode(info){
        let dInfo = await this.app.redis.hgetall(info.inviteCode);
        if(dInfo && dInfo.code){
            if(dInfo.invitee == info.uid){
                dInfo.invitee = "0";
                await this.app.redis.hmset(info.inviteCode,dInfo);
            }
            if(dInfo.inviter == info.uid){
                this.logger.info("房主离开，code失效");
                await this.app.redis.del(info.inviteCode);
            }
        }
    }

}



module.exports = DoubleService;