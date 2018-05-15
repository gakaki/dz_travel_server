const Service = require('egg').Service;
const utils = require("../../utils/utils");
const travelConfig = require("../../../sheets/travel");


class FriendService extends Service {
    /**
     * 获取我的全部好友
     * @param {friendList<Array>} 我的好友列表
     * @param uid
     * @return {Promise<Array>}
     */
    async findMyFriends(friendList, uid, time) {
        let friendCurrentCitys = await this.ctx.model.TravelModel.CurrentCity.find({ uid: friendList });
        this.app.getLogger('debugLogger').info(`获取好友地理位置耗时 ${Date.now() - time} ms`);
        let friends = await this.getUsersInfo(friendCurrentCitys);
        this.app.getLogger('debugLogger').info(`获取好友信息耗时 ${Date.now() - time} ms`);
        if (friends.length < travelConfig.Parameter.Get(travelConfig.Parameter.MAINFRIEND).value) {
            // 人员不足的时候全国来几个
            friendList.push(uid);
            let cityFriends = await this.findCountryFriends(friendList, (travelConfig.Parameter.Get(travelConfig.Parameter.MAINFRIEND).value - friends.length), time);
            this.app.getLogger('debugLogger').info(`获取非好友信息耗时 ${Date.now() - time} ms`);
            friends = friends.concat(cityFriends);
        }
       // this.logger.info(friends);
        return friends;
    }

    /**
     * 获取我的同城好友
     * @param {friendList<Array>} 我的好友列表
     * @param cid  城市id
     * @param uid  自己的id
     * @return {Promise<Array>}
     */
    async findMySameCityFriends(friendList, cid, uid, paruid) {
        // if(paruid) {
        //     let index = friendList.findIndex(n => n == paruid);
        //     if(index > -1) {
        //         friendList = friendList.splice(index, 1);
        //     }
        // }
        let friendCurrentCitys = await this.ctx.model.TravelModel.CurrentCity.find({ uid: friendList, cid: cid.toString() });
        let friends = await this.getUsersInfo(friendCurrentCitys);
        this.logger.info(friends);
        if (friends.length < travelConfig.Parameter.Get(travelConfig.Parameter.PLAYFRIEND).value) {
            // 人员不足的时候同城市的来几个
            friendList.push(uid);
            // if(paruid) {
            //     friendList.push(paruid)
            // }
            let cityFriends = await this.findSameCityFriends(friendList, cid, (travelConfig.Parameter.Get(travelConfig.Parameter.PLAYFRIEND).value - friends.length));
            this.logger.info(cityFriends);
            if(cityFriends.length) {
                friends = friends.concat(cityFriends);
            }

        }
        return friends.filter(n => n.uid != uid && n.uid != paruid);
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
        if(number) {
            friendCurrentCitys = utils.shuffle(friendCurrentCitys).slice(0, number);
        }
        return await this.getUsersInfo(friendCurrentCitys);
    }

    /**
     * 获取全国陌生人
     * @param myFriendList
     * @param number
     * @return {Promise<*>}
     */
    async findCountryFriends(myFriendList, number, time) {
        if(!number) {
            return [];
        }
        //let friendCurrentCitys = await this.ctx.model.TravelModel.CurrentCity.find({ uid: { $nin: myFriendList } }).limit(number);
        let friendCurrentCitys = await this.ctx.model.TravelModel.CurrentCity.aggregate([
            { $match: { uid: { $nin: myFriendList } } },
            { $sample: { size: number } },
            ]);
        this.app.getLogger('debugLogger').info(`获取非好友地理位置耗时 ${Date.now() - time} ms`);
        // if(number) {
        //     friendCurrentCitys = utils.shuffle(friendCurrentCitys).slice(0, number);
        // }
        return await this.getUsersInfo(friendCurrentCitys);
    }

    async getUsersInfo(users) {
        let friends = [];
        for(let user of users) {
            let friendInfo = await this.ctx.model.PublicModel.User.findOne({ uid: user.uid });
            if(friendInfo) {
                let friend = {
                    uid: friendInfo.uid,
                    nickName: friendInfo.nickName,
                    avatarUrl: friendInfo.avatarUrl,
                    cid: user.cid,
                    cityName: travelConfig.City.Get(user.cid).city,
                };
                friends.push(friend);
            }

        }
        return friends;
    }
}

module.exports = FriendService;