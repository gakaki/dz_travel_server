const Service = require('egg').Service;

class FriendService extends Service {
    async findFriends(uid,cid) {
        // 优先和你的好友
        let friends = findWechatFriends();
        if ( friends.length < 2){
            // 人员不足的时候同城市的来几个
            let cityFriends = this.findSameCityFriends();
            friends         = friends.concat(cityFriends);
        }
        return friends;
    }

    async findWechatFriends(){
        return [];
    }
    async findSameCityFriends(){
        return [];
    }
}

module.exports = FriendService;