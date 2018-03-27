const Service = require('egg').Service;

class PlayerService extends Service {

    async showPlayerInfo(info, ui) {
        let visit = await this.ctx.model.TravelModel.CurrentCity.findOne({uid: ui.uid});
        let playerFootprints =  await this.ctx.model.TravelModel.Footprints.count({uid: ui.uid});
        let total = await this.ctx.model.TravelModel.Footprints.aggr;
        info.info = {
            uid: ui.uid,
            nickName: ui.nickName,
            avatarUrl: ui.avatarUrl,
            gender: ui.gender,
            totalArrive: playerFootprints,
            overmatch: null,
            city: visit.city,
            province: visit.province,
            country: visit.country,
            online: ui.online,
            items: ui.items,
            rentItems: visit.rentItems,
            friends: ui.friendList,
            otherUserInfo: {
                totalIntegral: null,
                mileage: null,
                postcard: null,
                comment: null,
                likeNum: null,
                specialty: null,
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