const Service = require('egg').Service;
const travelConfig = require("../../../sheets/travel");

class TravelService extends Service {
    async fillIndexInfo(info,ui) {
        // info typeof apis.IndexInfo
          info.isFirst = ui.isFirst;
          info.playerInfo = {
              uid:ui.uid,
              nickName:ui.nickName,
              avatarUrl:ui.avatarUrl,
              gold:ui.items[travelConfig.Item.GOLD]
          };
          let visit =  await this.ctx.model.TravelModel.CurrentCity.findOne({uid: ui.uid});
          info.season = await this.ctx.service.publicService.thirdService.getSeason();
          if(visit.city){
            let weather =  (await this.ctx.service.publicService.thirdService.getWeather(visit.city)).now.text;
            let outw = 1;
            for(let we of travelConfig.weathers){
                if(we.weather == weather){
                    outw = weather;
                    break;
                }
            }
              info.weather = outw;
          }
          info.playerCnt = (await this.app.redis.get("travel_userid"))-1000;
          info.friend = user.friendList;

          let msgs = await this.ctx.model.TravelModel.UserMsg.find({uid:ui.uid}).sort({date:-1}).limit(20);
          info.unreadMsgCnt=msgs
    }

    async selectCity(info,ui){
        info.playerInfo = {
            uid:ui.uid,
            nickName:ui.nickName,
            avatarUrl:ui.avatarUrl,
            gold:ui.ui[travelConfig.Item.GOLD]
        };
        let visit =  await this.ctx.model.TravelModel.CurrentCity.findOne({uid: info.uid});
        info.season = await this.ctx.service.publicService.thirdService.getSeason();
        if(visit && visit.city){
            let weather =  (await this.ctx.service.publicService.thirdService.getWeather(visit.city)).now.text;
            let outw = 1;
            for(let we of travelConfig.weathers){
                if(we.weather == weather){
                    outw = weather;
                    break;
                }
            }
            info.weather = outw;
        }
        info.festival
        info.date
        info.cost
    }


    visit(info,ui){
        info.cid
    }

    async goTravel(info){
        let invitation = info.invitation;
        let iv = await this.app.redis.hgetall(invitation);
        if(!iv.ivp){
            iv.ivp = invitation.uid;
            await this.app.redis.hmset(invitation,iv);
        }
    }

    async letsGo(info){
        let friend = info.friend;
        if(friend){

        }
    }

    async getTravelLog(info,ui) {
        let page = info.page ? Number(info.page) : 1;
        let limit = info.length ? Number(info.length) : 20;
        let logs = await this.ctx.model.TravelModel.TravelLog.aggregate([{ $match: {"uid":"123"} }])
            .group({ _id: "$date", onedaylog: {$push: {city:"$city",rentCarType:"$rentCarType",scenicspot:"$scenicspot"}}})
            .sort({date:-1}).skip((page-1)*limit).limit(limit);
        info.allLogs = logs;
    }

}




module.exports=TravelService;