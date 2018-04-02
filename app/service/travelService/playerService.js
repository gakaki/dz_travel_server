const Service = require('egg').Service;
const travelConfig = require("../../../sheets/travel");
const utils = require("../../utils/utils");
class PlayerService extends Service {

    async showPlayerInfo(info, ui) {
        let visit = await this.ctx.model.TravelModel.CurrentCity.findOne({uid: ui.uid});
        let totalFootprints = await this.ctx.model.TravelModel.Footprints.aggregate([{ $sortByCount: "$uid" }]);
        let playerFootprints = totalFootprints.find((n) => n._id == ui.uid);
        let playerIndex = totalFootprints.findIndex((n) => n._id == ui.uid);
        let total = totalFootprints.length;
        this.logger.info(totalFootprints);
        this.logger.info(playerIndex + '   6666666666666666');
        let overMatch = 0;
        if (playerIndex == -1) {
           playerIndex = total;
        }
        if (total) {
            overMatch = (((total - playerIndex) / total) * 100).toFixed(2);
        }
        let addScore = await this.ctx.model.PublicModel.UserItemCounter.findOne({uid: ui.uid,index:travelConfig.Item.POINT});
        let postCards = await this.ctx.model.TravelModel.Postcard.aggregate([{ $match: {"uid":ui.uid} }]).group({ _id: "$uid", number: {$sum: "$number"}});
        let comment = await this.ctx.model.TravelModel.Comment.count({"uid":ui.uid});
        let likes = await this.ctx.model.TravelModel.Comment.aggregate([{ $match: {"uid":ui.uid} }]).group({ _id: "$uid", likes: {$sum: "$likes"}});
        let specialty = await this.ctx.model.TravelModel.Specialty.aggregate([{ $match: {"uid":ui.uid} }]).group({ _id: "$uid", number: {$sum: "$number"}});

        info.info = {
            uid: ui.uid,
            nickName: ui.nickName,
            avatarUrl: ui.avatarUrl,
            gender: ui.gender,
            totalArrive: playerFootprints?playerFootprints.count:0,
            overmatch: overMatch,
            city: visit?travelConfig.City.Get(visit.cid).city:"初次旅行",
            province: visit?travelConfig.City.Get(visit.cid).province:"初次旅行",
            country: visit?travelConfig.City.Get(visit.cid).country:"初次旅行",
            online: ui.online,
            items: ui.items,
            rentItems: visit?visit.rentItems:{},
            friends: ui.friendList,
            otherUserInfo: {
                totalIntegral: addScore ? addScore :0,
                mileage: ui.mileage,
                postcard: postCards.length > 1 ?postCards[0].number:0,
                comment: comment,
                likeNum: likes.length > 1 ? likes[0].likes : 0,
                specialty: specialty.length>1 ? specialty[0].number : 0,
            }
        }

    }

    async travelFootprint(info,ui){
        let userfootprints = await this.ctx.model.TravelModel.Footprints.aggregate([
            {$match:{uid:ui.uid}},
            {$group:{_id:"$province",citys:{$addToSet:{cid:"$cid"}},scenicspots:{$addToSet:{scenicspot:"$scenicspot"}}}},
            {$project:{_id:0,province:"$_id",citys:1,scenicspots:1}}
            ]);

        let totalCitys = travelConfig.citys.length;
        let totalScenicspots = travelConfig.scenicspots.length;
        let totalEvents = travelConfig.events.length;
        let totalPostcards = travelConfig.postcards.length;
        this.logger.info("总城市 "+ totalCitys);
        this.logger.info("总景点 "+ totalScenicspots);
        this.logger.info("总事件 "+ totalEvents);
        this.logger.info("总明信片 "+ totalPostcards);
        let totalArrive = 0;
        let userscenicspots = 0;
        for(let footprint of userfootprints){
            let citys = footprint.citys;
            let scenicspots = footprint.scenicspots;
            totalArrive += citys.length;
            userscenicspots += scenicspots.length;
        }
        this.logger.info("用户去过的城市 "+ totalArrive);
        let totalArrivePercent = ((totalArrive/totalCitys)*100).toFixed(2);
        this.logger.info("城市百分比 "+ totalArrivePercent);
        info.items = ui.items;
        info.userInfo ={
            uid:ui.uid,
            nickName:ui.nickName,
            avatarUrl:ui.avatarUrl
        }
        info.reachrovince = userfootprints.length;
        info.totalArrive = totalArrive;
        info.totalArrivePercent = totalArrivePercent;
        //完成度计算  (用户到达的景点数+ 触发的事件数+ 收集明星片数）/ (总景点数 + 总事件数 + 总明信片数)
        let userEvents = await this.ctx.model.TravelModel.TravelEvent.aggregate([
            {$match:{uid:ui.uid}},
            {$group:{_id:"$eid"}}
        ]);
        let userPostcards = await this.ctx.model.TravelModel.Postcard.aggregate([
            {$match:{uid:ui.uid}},
            {$group:{_id:"$ptid"}}
        ]);
        let userProgress = userscenicspots + userEvents.length + userPostcards.length;
        this.logger.info("用户进度 "+ userProgress);
        let totalProgress = totalScenicspots + totalEvents + totalPostcards;
        this.logger.info("总进度 "+ totalProgress);
        let travelPercent = ((userProgress/totalProgress)*100).toFixed(2);
        this.logger.info("进度百分比 "+ travelPercent);
        info.travelPercent = travelPercent;


    }

    async showFlyTicket(info,ui){
        let tickets = await this.ctx.model.TravelModel.FlyTicket.find({uid:ui.uid,isUse:false});
        let flyTickets = [];
        this.logger.info("赠送机票 "+ tickets)
        for(let ticket of tickets){
            let flyTicket ={
                tid:ticket.id,
                cid : ticket.cid,
                type : ticket.flyType
            };
            flyTickets.push(flyTicket);
        }
        info.ticket = flyTickets;
    }

    async getMessage(info,ui,type){
        let page = Number(info.page)?Number(info.page):1;
        let limit = Number(info.limit)?Number(info.limit):travelConfig.Parameter.Get(travelConfig.Parameter.COUNTLIMIT).value;
        let msgs =await this.ctx.service.travelService.msgService.unreadMsgs(ui.uid,type,page,limit);
        let messages = [];
        for(let msg of msgs){
            let message ={
                 mid:msg.mid,
                type:msg.type,
                title:msg.title,
                date:msg.date.format("yyyy-MM-dd"),
                content:msg.content
            };
            messages.push(message);
         // await this.ctx.model.TravelModel.UserMsg.update({mid:msg.mid},{$set:{isRead:true}});
        }
        info.messages = messages
    }

    async clearMsg(info,ui,msg){
        await this.ctx.model.TravelModel.UserMsg.update({createDate:{$lte:msg.createDate}},{$set:{isRead:true}},{multi:true})
    }

    async checkMsgCnt(info,ui){
        info.unreadMsgCnt = await this.ctx.service.travelService.msgService.unreadMsgCnt(ui.uid);
    }

    async setRealInfo(info, ui) {
       await this.ctx.model.PublicModel.User.update({uid: ui.uid}, {
            $set: {
                name: info.name,
                birth: info.birthday,
                mobile: info.phone,
                address: info.address
            }
        });

       //收货地址单独存一份，以便于以后扩展为多个收货地址
       await this.ctx.model.TravelModel.Address.update({uid: ui.uid}, {
           $set: {
               name: info.name,
               tel: info.phone,
               addr: info.address
           }
       },{upsert:true});

        info.realInfo = {
            uid: ui.uid,
            name: info.name,
            birthday: info.birthday,
            phoneNumber: info.phone,
            address: info.address
        }
    }


    getRealInfo(info, ui) {
        info.realInfo = {
            uid: ui.uid,
            name: ui.name,
            birthday: ui.birth,
            phoneNumber: ui.mobile,
            address: ui.address
        }
    }

    //获取玩家的收货地址
    async getMailAddress(res, ui) {
        //当前只有一个收货地址，以后如果改为多个，记得改逻辑并返回默认收货地址
        let addr = await this.ctx.model.TravelModel.Address.findOne({uid: ui.uid});
        res.nickName = addr.name;
        res.tel = addr.tel;
        res.addr = addr.addr;
    }

    async showMyPostcards(info,ui) {
      let postcards = await  this.ctx.model.TravelModel.Postcard.aggregate([
          {$match: {uid: ui.uid}},
          {$sort:{createDate:-1}},
          {$group: {_id:"$province",collectPostcardNum:{$sum:1},citys:{$push:{cid:"$cid"}},pcards:{$push:{ptid:"$ptid",createDate:"$createDate"}}}},
          {$project : {_id: 0, province :"$_id", collectPostcardNum : 1,citys:1,pcards:1}}
            ]);
      let postcardInfos = [];
      for(let postcard of postcards){
          let citys = postcard.citys;
          let postcardnum = 0;
          let postcardInfo ={
              postid:postcard.pcards[0].ptid,
              province:postcard.province,
              collectPostcardNum:postcard.collectPostcardNum
          };
          for(let city of citys){
              postcardnum += travelConfig.City.Get(city.cid).postcardnum;
          }
          postcardInfo.allPostcardNum = postcardnum;
          postcardInfos.push(postcardInfo);

      }
        info.postcardInfo = postcardInfos;
    }
    async showCityPostcards(info,ui){

        let postcards = await  this.ctx.model.TravelModel.Postcard.aggregate([
            {$match: {uid: ui.uid,province:info.province}},
            {$sort:{createDate:-1}},
            {$group:{_id:"$cid",collectPostcardNum:{$sum:1},postcard:{$push:{pscid:"$pscid",ptid:"$ptid",createDate:"$createDate"}}}},
            {$project:{_id:0,cid:"$_id",collectPostcardNum:1,postcard:1}}
        ]);

        let postcardInfos = [];
        for(let postcard of postcards){
            let postcardInfo ={
                city:travelConfig.City.Get(postcard.cid).city,
                collectPostcardNum:postcard.collectPostcardNum,
                allPostcardNum : travelConfig.City.Get(postcard.cid).postcardnum,
            };

            let postcardBriefDetails = [];
            for(let pt of postcard.postcard){
                let postcardBriefDetail={};
                if(Number(info.LM)){
                    let chats = await this.ctx.model.TravelModel.PostcardChat.find({pscid:pt.pscid}).sort({createDate:-1});
                    if(chats.length>0){
                        postcardBriefDetail ={
                            id : pt.pscid,
                            postid: pt.ptid,
                        };
                        let chat = chats[0];
                        let sender = await this.ctx.model.PublicModel.User.findOne({uid:chat.sender});
                        postcardBriefDetail.lastestLiveMessage= {
                            id:chat.chatid,
                            time:(chat.createDate).format("yyyy-MM-dd"),
                            userInfo:{
                                uid:sender.uid,
                                nickName:sender.nickName,
                                avatarUrl:sender.avatarUrl
                            },
                            message:chat.context
                        };
                        this.logger.info("时间 ：" ,(chat.createDate).format("yyyy-MM-dd") )
                    }
                }else{
                    postcardBriefDetail ={
                        id : pt.pscid,
                        postid: pt.ptid,
                    };
                }
                if(postcardBriefDetail && postcardBriefDetail.id){
                    postcardBriefDetails.push(postcardBriefDetail)
                }

            }
            postcardInfo.postcardsDetail = postcardBriefDetails;


            postcardInfos.push(postcardInfo);
        }
        info.postcardInfo = postcardInfos;

    }

    async showDetailPostcard(info,ui){
        let page = Number(info.page)?Number(info.page):1;
        let limit = Number(info.messageLength)?Number(info.messageLength):travelConfig.Parameter.Get(travelConfig.Parameter.MAXMESSAGE).value;
        let chats = await this.ctx.model.TravelModel.PostcardChat.find({pscid:info.id}).sort({createDate:-1}).skip((page-1)*limit).limit(limit);
        let postcard = await this.ctx.model.TravelModel.Postcard.findOne({pscid:info.id});
        info.postid = postcard.ptid;
        let detailLiveMessages = [];
        for(let i = 0 ;i < chats.length ; i++){
            let chat = chats[i];
            let sender = await this.ctx.model.PublicModel.User.findOne({uid:chat.sender});
            let detailLiveMessage ={
                id:chat.chatid,
                time:(chat.createDate).format("yyyy-MM-dd hh:mm:ss"),
                userInfo:{
                    uid:sender.uid,
                    nickName:sender.nickName,
                    avatarUrl:sender.avatarUrl
                },
                message:chat.context
            };
            if(chats.length > 1){
                if( i == 0){
                    detailLiveMessage.hasNext = false;
                    detailLiveMessage.hasUp = true;
                }else if(i == chats.length-1){
                    detailLiveMessage.hasNext = true;
                    detailLiveMessage.hasUp = false;
                }else{
                    detailLiveMessage.hasNext = true;
                    detailLiveMessage.hasUp = true;
                }
            }else{
                detailLiveMessage.hasNext = false;
                detailLiveMessage.hasUp = false;
            }

            detailLiveMessages.push(detailLiveMessage);
        }
        info.lastestMessage=detailLiveMessages;
    }

    async sendPostcardMsg(info,ui,postcard){
        let chatid = "chat"+new Date().getTime();
        await this.ctx.model.TravelModel.PostcardChat.create({
            uid:postcard.uid,//拥有者
            pscid:postcard.pscid,//明信片
            chatid:chatid,
            sender:ui.uid,//回复者
            context:info.message,
            createDate:new Date()
        });
        let chats = await this.ctx.model.TravelModel.PostcardChat.find({psccid:postcard.psccid});
        let senders = new Set();
        for(let chat of chats){
            senders.add(chat.sender);
        }
        if(!senders.has(postcard.uid)){
            senders.add(postcard.uid)
        }
        //给所有人发送留言
        for(let senderid of senders){
            let sender = await this.ctx.model.PublicModel.User.findOne({uid:senderid});
            let senderNickName = sender.nickName;
            let context = travelConfig.Message.Get(travelConfig.Message.POSTCARDMESSAGE).content;
            let content = context.replace("s%",senderNickName);
            await this.ctx.model.TravelModel.UserMsg.create({
                uid:senderid,
                mid:"msg"+travelConfig.Message.POSTCARDMESSAGE+new Date().getTime(),
                type:travelConfig.Message.POSTCARDMESSAGE,
                title:travelConfig.Message.Get(travelConfig.Message.POSTCARDMESSAGE).topic,
                content:content,
                date:new Date()
            })
        }
    }

    async signInfo(info,ui){
        info.hasSign = await this.ctx.model.PublicModel.SignInRecord.count({uid: ui.uid, createDate: new Date().format("yyyy-MM-dd")});
        let cumulativeDays = (ui.cumulativeDays + 1);
        let day = cumulativeDays % 7;
        if (day == 0) {
            day = 7
        }
        info.theDay = day;
    }
    async toSign(info,ui){
        let cumulativeDays = (ui.cumulativeDays + 1);
        let day = cumulativeDays % 7;
        if (day == 0) {
            day = 7
        }
        let cost ={
            cumulativeDays:1
        };
        cost["items."+travelConfig.Item.GOLD] = travelConfig.Login.Get(day).gold;
        let itemChange = {
            ["items."+travelConfig.Item.GOLD] : travelConfig.Login.Get(day).gold
        };

        await this.ctx.model.PublicModel.SignInRecord.create({
            uid: ui.uid,
            appName: "travel",
            createDate: new Date().format("yyyy-MM-dd"),
            createDateTime:new Date()
        });
        await this.ctx.model.PublicModel.User.update({uid: ui.uid}, {$inc: cost});
        this.ctx.service.publicService.itemService.itemChange(ui, itemChange, "travel");

    }

}


module.exports = PlayerService;