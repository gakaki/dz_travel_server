const Service = require('egg').Service;
const travelConfig = require("../../../sheets/travel");
class PlayerService extends Service {

    async showPlayerInfo(info, ui) {
        let visit = await this.ctx.model.TravelModel.CurrentCity.findOne({uid: ui.uid});
        let totalFootprints = await this.ctx.model.TravelModel.Footprints.aggregate([{ $sortByCount: "$uid" }]);
        let playerFootprints  =  totalFootprints.find((n) => n._id == ui.uid);
        let playerIndex  =  totalFootprints.findIndex((n) => n._id == ui.uid);
        let total = totalFootprints.length;
        let overMatch = Math.floor(((total-playerIndex) / total)*100);
        let addScore = await this.ctx.model.publicModel.UserItemCounter.findOne({uid: ui.uid,index:travelConfig.Item.POINT});
        let postCards = await this.ctx.model.TravelModel.PostCard.aggregate([{ $match: {"uid":ui.uid} }]).group({ _id: "$uid", number: {$sum: "$number"}});
        let comment = await this.ctx.model.TravelModel.Comment.count({"uid":ui.uid});
        let likes = await this.ctx.model.TravelModel.Comment.aggregate([{ $match: {"uid":ui.uid} }]).group({ _id: "$uid", likes: {$sum: "$likes"}});
        let specialty = await this.ctx.model.TravelModel.Specialty.aggregate([{ $match: {"uid":ui.uid} }]).group({ _id: "$uid", number: {$sum: "$number"}});
        info.info = {
            uid: ui.uid,
            nickName: ui.nickName,
            avatarUrl: ui.avatarUrl,
            gender: ui.gender,
            totalArrive: playerFootprints.count,
            overmatch: overMatch,
            city: visit.city,
            province: visit.province,
            country: visit.country,
            online: ui.online,
            items: ui.items,
            rentItems: visit.rentItems,
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
      let postcards = await  this.ctx.model.TravelModel.PostCard.aggregate([
          {$match: {uid: ui.uid}},
          {$group: {_id:"$province",collectPostcardNum:{$sum:1},citys:{$push:{cid:"$cid"}}}},
          {$project : {_id: 0, province :"$_id", collectPostcardNum : 1}}
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

        let postcards = await  this.ctx.model.TravelModel.PostCard.aggregate([
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
                    let postcardBriefDetail ={
                        id : pt.ptid,
                        postid: pt.pscid,
                    };
                    if(!Number(info.LM)){
                        let chats = await this.ctx.model.TravelModel.Chat.find({uid:uid.uid,pscid:pt.pscid}).sort({createDate:-1});
                        if(chats.length>0){
                            postcardBriefDetail.lastestLiveMessage= {

                            }
                        }
                    }

                    postcardBriefDetails.push(postcardBriefDetail)
                }
                postcardInfo.postcardsDetail = postcardBriefDetails;


            postcardInfos.push(postcardInfo);
        }
        info.postcardInfo = postcardInfos;

    }

}


module.exports = PlayerService;