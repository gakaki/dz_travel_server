const Service = require('egg').Service;
const travelConfig = require("../../../sheets/travel");

class TravelService extends Service {
    async fillIndexInfo(info) {
        // info typeof apis.IndexInfo
        let user = await this.ctx.model.PublicModel.User.findOne({uid: info.uid});
          info.isFirst = user.isFirst;
          info.playerInfo = {
              uid:user.uid,
              nickName:user.nickName,
              avatarUrl:user.avatarUrl,
              gold:user.items[travelConfig.Item.GOLD]
          };
          let visit =  await this.ctx.model.TravelModel.CurrentCity.findOne({uid: info.uid});
          info.season = await this.ctx.service.publicService.thirdService.getSeason();
          info.weather = await this.ctx.service.publicService.thirdService.getWeather(visit.city);
          info.playerCnt = (await this.app.redis.get("travel_userid"))-1000;
          info.friend = user.friendList;

          let msgs = await this.ctx.model.TravelModel.UserMsg.find({uid:info.uid}).sort({date:-1});
          info.unreadMsgCnt=msgs .slice(0,20);
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
}




module.exports=TravelService;