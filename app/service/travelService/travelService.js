const Service = require('egg').Service;
const travelConfig = require("../../../sheets/travel");


class TravelService extends Service {
    async fillIndexInfo(info,ui) {
        // info typeof apis.IndexInfo
        info.isFirst = ui.isFirst;
          info.gold=ui.items[travelConfig.Item.GOLD];
          let visit =  await this.ctx.model.TravelModel.CurrentCity.findOne({uid: ui.uid});
          info.season = await this.ctx.service.publicService.thirdService.getSeason();
        let outw = 1;
          if(visit && visit.city){
            let weather =  (await this.ctx.service.publicService.thirdService.getWeather(visit.city)).now.text;
            for(let we of travelConfig.weathers){
                if(we.weather == weather){
                    outw = weather;
                    break;
                }
            }
            info.location = visit.city;
          }
         info.weather = outw;
          info.playerCnt = (await this.app.redis.get("travel_userid"));
          info.friend = ui.friendList;

          let msgs = await this.ctx.model.TravelModel.UserMsg.find({uid:ui.uid}).sort({date:-1}).limit(20);
          info.unreadMsgCnt=msgs
    }

    async selectCity(info,ui){
        info.gold = ui.items[travelConfig.Item.GOLD];
        info.isFirst = ui.isFirst;
        let outw = 1;
        let holiday =this.ctx.service.publicService.thirdService.getHoliday();
        let cost = travelConfig.Parameter.Get(travelConfig.Parameter.COMMONTICKETPRICE).value;
        let dcost = travelConfig.Parameter.Get(travelConfig.Parameter.DOUBLETICKETPRICE).value;
        let rcost = travelConfig.Parameter.Get(travelConfig.Parameter.RANDOMTICKETPRICE).value;
        let multiple = travelConfig.Parameter.Get(travelConfig.Parameter.BUSYSEASON).value;
        if(holiday.length>0){
            cost = cost * multiple;
            dcost = dcost * multiple;
            rcost = rcost * multiple;
            info.holiday = holiday[0];
        }
        if(!ui.isFirst){
            let visit =  await this.ctx.model.TravelModel.CurrentCity.findOne({uid: info.uid});
            if(visit.city){
                let weather = await this.ctx.service.publicService.thirdService.getWeather(visit.city);
                for(let we of travelConfig.weathers){
                    if(we.weather == weather){
                        outw = weather;
                        break;
                    }
                }

            }
            info.location = visit.city;

            if(info.type == "00" ){
                info.cost = rcost;
            }else if(info.type == "01"){
                info.cost = cost;
                info.doubleCost =dcost;
            }else if(info.type == "11" || info.type == "12"){
                info.cost = 0;
                info.doubleCost =0;
            }


        }else{
            info.cost = 0;
            info.doubleCost = 0;
        }


        if(info.type == "00"){
            info.cid =  await this.ctx.service.publicService.thirdService.getRandomTicket(ui.uid);
        }

        info.weather = outw;
        info.season = await this.ctx.service.publicService.thirdService.getSeason();
        info.date = new Date().toLocaleDateString();

    }


    async visit(info,ui){
        let cid =info.cid;
        let fid =info.partnerUid;
        let ttype =info.type;


        let visit = await this.ctx.model.TravelModel.CurrentCity.findOne({uid: ui.uid});
        let cost ={
            ["items."+ttype] :-1,
            ["items."+travelConfig.Item.GOLD] :(Number(info.cost)) * -1
        };
        //使用赠送机票
        if(info.type == "11" || info.type =="12"){
            let flyType = info.type.indexOf("2") !=-1 ? 2 :1;
            this.ctx.model.TravelModel.FlyTicket.update({uid:ui.uid,isGive:1,flyType:flyType,cid:info.cid,number: {$gt: 0}},{$inc:{number:-1}});

        }
        //道具更新
        this.ctx.model.PublicModel.User.update({uid:ui.uid,["items."+travelConfig.Item.GOLD]:{$gt:0}},{$inc:{ ["items."+travelConfig.Item.GOLD] :(Number(info.cost)) * -1}});
        this.ctx.service.publicService.itemService.itemChange(ui,cost);
        let flyRecord = {
            uid:ui.uid,      //用户ID
            from:visit?visit.cid:"初次旅行",           //出发地
            destination:cid,   //目的地
            ticketType:ttype,//机票类型
            isDoublue:fid ? true :false,//是否双人旅行
            cost:Number(info.cost),                        //花费的金币
            createDate:new Date()
        };
        let rentItems={};
        for(let rentItem of travelConfig.shops){
            rentItems[rentItem] = 0;
        }
        let currentCity = {
                uid: ui.uid,
                cid: cid,
                country: travelConfig.City.Get(cid).country ? travelConfig.City.Get(cid).country : "中国",
                province: travelConfig.City.Get(cid).province,
                city: travelConfig.City.Get(cid).city,
                rentItems: rentItems
            };
        //双人旅行
        if(fid){
            flyRecord.friend=fid;
            currentCity.friend=fid;
            this.ctx.model.TravelModel.FlightRecord.create(flyRecord);
            this.ctx.model.TravelModel.CurrentCity.update({uid:ui.uid},currentCity,{upsert:true});
            //更新好友
            this.ctx.model.PublicModel.User.update({uid:ui.uid},{$addToSet: {friendsList: fid}});
            let fvisit = await this.ctx.model.TravelModel.CurrentCity.findOne({uid: fid});
            flyRecord.uid = fid;
            flyRecord.friend = ui.uid;
            flyRecord.from = fvisit?fvisit.cid:"初次旅行";
            currentCity.uid =fid;
            currentCity.friend = ui.uid;
            this.ctx.model.PublicModel.User.update({uid:fid},{$addToSet: {friendsList: ui.uid}});

        }

      //添加飞行记录
        this.ctx.model.TravelModel.FlightRecord.create(flyRecord);
        //更新玩家所在地
        this.ctx.model.TravelModel.CurrentCity.update({uid:ui.uid},currentCity,{upsert:true})
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
        let logs = await this.ctx.model.TravelModel.TravelLog.aggregate([
            { $match: {"uid":ui.uid} },
            {$group:{ _id: "$date", onedaylog: {$push: {city:"$city",rentCarType:"$rentCarType",scenicspot:"$scenicspot",createDate:"$createDate"}}}},
            {$project:{time:"$_id",onedaylog:1}}
            ])
            .sort({time:-1,["onedaylog.createDate"]:-1})
            .skip((page-1)*limit)
            .limit(limit);
        info.allLogs = logs;
    }

}




module.exports=TravelService;