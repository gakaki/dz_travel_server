const Service = require('egg').Service;
const travelConfig = require("../../../sheets/travel");
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
            overMatch = Math.floor(((total - playerIndex) / total) * 100);
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
            city: visit?visit.city:"初次旅行",
            province: visit?visit.province:"初次旅行",
            country: visit?visit.country:"初次旅行",
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

    async showFlyTicket(info,ui){
        let tickets = await this.ctx.model.TravelModel.FlyTicket.find({uid:ui.uid});
        info.ticket = tickets;
    }

    async setRealInfo(info, ui) {
        this.ctx.model.PublicModel.User.update({uid: ui.uid}, {
            $set: {
                name: info.name,
                birth: info.birthday,
                mobile: info.phone,
                address: info.adress
            }
        });

        info.realInfo = {
            uid: ui.uid,
            name: info.name,
            birthday: info.birthday,
            phoneNumber: info.phone,
            adress: info.adress
        }
    }


    getRealInfo(info, ui) {
        info.realInfo = {
            uid: ui.uid,
            name: ui.name,
            birthday: ui.birth,
            phoneNumber: ui.mobile,
            adress: ui.address
        }
    }
    async showMyPostcards(info,ui) {
      let postcards = await  this.ctx.model.TravelModel.Postcard.aggregate([
          {$match: {uid: ui.uid}},
          {$group: {_id:"$province",collectPostcardNum:{$sum:1},citys:{$push:{cid:"$cid"}}}},
          {$project : {_id: 0, province :"$_id", collectPostcardNum : 1,citys:1}}
            ]);
      let postcardInfos = [];
      for(let postcard of postcards){
          let citys = postcard.citys;
          let postcardnum = 0;
          let postcardInfo ={
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
            {$group:{_id:"$cid",collectPostcardNum:{$sum:1},postcard:{$push:{pscid:"$pscid",ptid:"$ptid",createDate:"$createDate"}}}},
            {$project:{_id:0,cid:"$_id",collectPostcardNum:1,postcard:1}}
        ]).sort({cid:1,"postcard.createDate":-1});

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
                            id : pt.ptid,
                            postid: pt.pscid,
                        };
                        let chat = chats[0];
                        let sender = await this.ctx.model.PublicModel.User.findOne({uid:chat.sender});
                        postcardBriefDetail.lastestLiveMessage= {
                            id:chat.chatid,
                            time:new Date(chat.createDate).toLocaleString(),
                            userInfo:{
                                uid:sender.uid,
                                nickName:sender.nickName,
                                avatarUrl:sender.avatarUrl
                            },
                            message:chat.context
                        }
                    }
                }else{
                    postcardBriefDetail ={
                        id : pt.ptid,
                        postid: pt.pscid,
                    };
                }

                postcardBriefDetails.push(postcardBriefDetail)
            }
            postcardInfo.postcardsDetail = postcardBriefDetails;


            postcardInfos.push(postcardInfo);
        }
        info.postcardInfo = postcardInfos;

    }

    async showDetailPostcard(info,ui){
        let page = Number(info.page)?Number(info.page):1;
        let limit = Number(info.messageLength)?Number(info.messageLength):10;
        let chats = await this.ctx.model.TravelModel.PostcardChat.find({pscid:info.id}).sort({createDate:-1}).skip((page-1)*limit).limit(limit);
        let postcard = await this.ctx.model.TravelModel.Postcard.findOne({pscid:info.id});
        info.postid = postcard.ptid;
        let detailLiveMessages = [];
        for(let i = 0 ;i < chats.length ; i++){
            let chat = chats[i];
            let sender = await this.ctx.model.PublicModel.User.findOne({uid:chat.sender});
            let detailLiveMessage ={
                id:chat.chatid,
                time:new Date(chat.createDate).toLocaleString(),
                userInfo:{
                    uid:sender.uid,
                    nickName:sender.nickName,
                    avatarUrl:sender.avatarUrl
                },
                message:chat.context
            };
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
            detailLiveMessages.push(detailLiveMessage);
        }
        info.detailLiveMessage=detailLiveMessages;
    }

    async sendPostcardMsg(info,ui,postcard){
        let chatid = "chat"+new Date().getTime();
        this.ctx.model.TravelModel.PostcardChat.create({
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
                title:travelConfig.Message.Get(travelConfig.Message.POSTCARDMESSAGE).topic,
                context:content,
                date:new Date()
            })
        }
    }

    async signInfo(info,ui){
        info.hasSign = await this.ctx.model.PublicModel.SignInRecord.count({uid: ui.uid, createDate: new Date().toLocaleDateString()});
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
            createDate: new Date().toLocaleDateString(),
            createDateTime:new Date()
        });
        await this.ctx.model.PublicModel.User.update({uid: ui.uid}, {$inc: cost});
        this.ctx.service.publicService.itemService.itemChange(ui, itemChange, "travel");

    }

}


module.exports = PlayerService;