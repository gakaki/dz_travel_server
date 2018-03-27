const Service = require('egg').Service;
const travelConfog = require("../../../sheets/travel");
class PlayerService extends Service {

    async showPlayerInfo(info, ui) {
        let visit = await this.ctx.model.TravelModel.CurrentCity.findOne({uid: ui.uid});
        let totalFootprints = await this.ctx.model.TravelModel.Footprints.aggregate([{ $sortByCount: "$uid" }]);
        let playerFootprints  =  totalFootprints.find((n) => n._id == ui.uid);
        let playerIndex  =  totalFootprints.findIndex((n) => n._id == ui.uid);
        let total = totalFootprints.length;
        let overMatch = Math.floor(((total-playerIndex) / total)*100);
        let addScore = await this.ctx.model.publicModel.UserItemCounter.findOne({uid: ui.uid,index:travelConfog.Item.POINT});
        let postCards = await this.ctx.model.TravelModel.PostCard.aggregate([{ $match: {"uid":ui.uid} }]).group({ _id: "$uid", number: {$sum: 1}});
        let comment = await this.ctx.model.TravelModel.Comment.count({"uid":ui.uid});
        let likes = await this.ctx.model.TravelModel.Comment.aggregate([{ $match: {"uid":ui.uid} }]).group({ _id: "$uid", likes: {$sum: 1}});
        let specialty = await this.ctx.model.TravelModel.Specialty.aggregate([{ $match: {"uid":ui.uid} }]).group({ _id: "$uid", number: {$sum: 1}});
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

}


module.exports = PlayerService;