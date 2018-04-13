const Service = require('egg').Service;

class FriendService extends Service {
    async findFriends(uid, cid, friendList = null) {

        let friends     = this.findMyFriends();
        if (friends.length < 2) {
            // 人员不足的时候同城市的来几个
            let cityFriends = this.findSameCityFriends();
            friends = friends.concat(cityFriends);
        }
        return friends;
    }

    async findMyFriends( uid , cid ){

        // 从user表查询fristList Array

        // 循环获取用户的地图信息

        return [];
    }
    async findSameCityFriends(){
        //若是微信里找不到或者数量太少了 那么寻找同一个城市的人吧

        return [];
    }
}

module.exports = FriendService;