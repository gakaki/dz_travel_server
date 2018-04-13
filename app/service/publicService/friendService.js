const Service = require('egg').Service;
const utils = require("../../utils/utils");


class FriendService extends Service {
    /**
     * 获取我的全部好友
     * @param {friendList<Array>} 我的好友列表
     * @param uid
     * @return {Promise<Array>}
     */
    async findMyFriends(friendList, uid) {
        let friendCurrentCitys = await this.ctx.model.TravelModel.CurrentCity.find({ uid: friendList });
        let friends = await this.getUsersInfo(friendCurrentCitys);
        if (friends.length < 2) {
            // 人员不足的时候同城市的来几个
            friendList.push(uid);
            let cityFriends = await this.findCountryFriends(friendList, 5);
            friends = friends.concat(cityFriends);
        }
        return friends;
    }

    /**
     * 获取我的同城好友
     * @param {friendList<Array>} 我的好友列表
     * @param cid  城市id
     * @param uid  自己的id
     * @return {Promise<Array>}
     */
    async findMySameCityFriends(friendList, cid, uid) {
        let friendCurrentCitys = await this.ctx.model.TravelModel.CurrentCity.find({ uid: friendList, cid: cid });
        let friends = await this.getUsersInfo(friendCurrentCitys);
        if (friends.length < 2) {
            // 人员不足的时候同城市的来几个
            friendList.push(uid);
            let cityFriends = this.findSameCityFriends(friendList, cid, 5);
            friends = friends.concat(cityFriends);
        }
        return friends;
    }

    /**
     *
     * 获取同城陌生人信息
     * @param {myFriendList<Array>} 我的好友列表
     * @param cid
     * @param number  想要随机获取陌生人的数量 ，可选 不传默认获取全部
     * @return {Promise<Array>}
     */
    async findSameCityFriends(myFriendList, cid, number) {
        //若是微信里找不到或者数量太少了 那么寻找同一个城市的人吧
        let friendCurrentCitys = await this.ctx.model.TravelModel.CurrentCity.find({ cid: cid, uid: { $nin: myFriendList } });
        let friends = await this.getUsersInfo(friendCurrentCitys);
        if(number) {
            friends = utils.shuffle(friends).slice(0, number);
        }
        return friends;
    }

    /**
     * 获取全国陌生人
     * @param myFriendList
     * @param number
     * @return {Promise<*>}
     */
    async findCountryFriends(myFriendList, number) {
        let friendCurrentCitys = await this.ctx.model.TravelModel.CurrentCity.find({ uid: { $nin: myFriendList } });
        let friends = await this.getUsersInfo(friendCurrentCitys);
        if(number) {
            friends = utils.shuffle(friends).slice(0, number);
        }

        return friends;
    }

    async getUsersInfo(users) {
        let friends = [];
        for(let user of users) {
            let friendInfo = await this.ctx.model.PublicModel.User.findOne({ uid: user.uid });
            let friend = {
                uid: friendInfo.uid,
                nickName: friendInfo.nickName,
                avatarUrl: friendInfo.avatarUrl,
                cid: user.cid,
                cityName: user.city,
            };
            friends.push(friend);
        }
        return friends;
    }
}

module.exports = FriendService;