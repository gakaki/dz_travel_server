const Service = require('egg').Service;
const travelConfig = require("../../../sheets/travel");
const apis = require("../../../apis/travel");
const moment = require("moment");

class RankService extends Service {
    /**
     * 更新一次积分榜单
     * */
    async updateScoreRankList() {
        let list = await this.ctx.model.TravelModel.IntegralRecord.find().sort({ integral: -1, updateDate: 1 }).limit(travelConfig.Parameter.Get(travelConfig.Parameter.RANKNUMBER).value);
        let idx = 1;
        let date = new Date();
        list = list.map(l => {
            let o = {};
            o.uid = l.uid;
            o.integral = l.integral;
            o.rank = idx++;
            o.createDate = date;
            return o;
        });

        await this.ctx.model.TravelModel.IntegralRank.remove();
        await this.ctx.model.TravelModel.IntegralRank.insertMany(list);

    }

    /**
     * 获取当前全国积分榜单
     * @param page 页码
     * @param limit 查询条数
     *
     * */
    async getScoreRankList( page,limit) {
        return await this.ctx.model.TravelModel.IntegralRank.find().skip((page - 1) * limit).limit(limit);
    }

    /**
     * 获取玩家在榜单中的排名
     * */
    async getUserScoreRank(uid) {
        let rankInfo = await this.ctx.model.TravelModel.IntegralRank.findOne({ uid: uid });
        return rankInfo ? rankInfo.rank : 0; //0表示未上榜
    }

    /**
     * 获取当前好友积分榜单
     * @param friendList 好友列表
     * @param page 页码
     * @param limit 查询条数
     * */
    async getUserFriendScoreRankList(friendList, page, limit) {
        return await this.ctx.model.TravelModel.IntegralRecord.find({ uid: friendList }).sort({ integral: -1, updateDate: 1 }).skip((page - 1) * limit).limit(limit);
    }

    /**
     * 更新一次足迹榜单
     *
     * */
    async updateFootRankList() {
        let list = await this.ctx.model.TravelModel.FootRecord.find().sort({ weeklightCityNum: -1, updateDate: 1 }).limit(travelConfig.Parameter.Get(travelConfig.Parameter.RANKNUMBER).value);
        let idx = 1;
        let date = new Date();
        list = list.map(l => {
            let o = {};
            o.uid = l.uid;
            o.lightCityNum = l.weeklightCityNum;
            o.rank = idx++;
            o.createDate = date;
            return o;
        });

        await this.ctx.model.TravelModel.FootRank.remove();
        await this.ctx.model.TravelModel.FootRank.insertMany(list);

        await this.ctx.model.TravelModel.FootRecord.update({}, { $set: { weekCompletionDegree: 0 } }, { multi: true });
    }

    /**
     * 更新足迹记录表
     * @param uid  require
     *
     * */
    async updateFootRecord(uid) {
        await this.ctx.model.TravelModel.FootRecord.update(
            { uid: uid },
            { $set: { uid: uid, updateDate: new Date() } },
            { $inc: { lightCityNum: 1, weeklightCityNum: 1 } },
            { upsert: true }
        );
    }

    /**
     * 获取当前足迹榜单
     * @page 页码
     * @param limit 查询条数
     * */
    async getFootRankList(page = 1, limit = travelConfig.Parameter.Get(travelConfig.Parameter.RANKNUMBER).value) {
        return await this.ctx.model.TravelModel.FootRank.find().skip((page - 1) * limit).limit(limit);
    }

    /**
     * 获取玩家在足迹榜单中的排名
     * */
    async getUserFootRank(uid) {
        let rankInfo = await this.ctx.model.TravelModel.FootRank.findOne({ uid: uid });
        return rankInfo ? rankInfo.rank : 0; //0表示未上榜
    }

    /**
     * 获取玩家点亮的城市
     * */
    async getUserFoot(uid) {
        return await this.ctx.model.TravelModel.FootRecord.findOne({ uid: uid });
    }

    /**
     * 获取当前好友足迹榜单
     * @param friendList 好友列表
     * @param page 页码
     * @param limit 查询条数
     * */
    async getUserFriendFootRankList(friendList, page, limit) {
        return await this.ctx.model.TravelModel.FootRecord.find({ uid: friendList }).sort({ lightCityNum: -1, updateDate: 1 }).skip((page - 1) * limit).limit(limit);
    }


    /**
     *
     * 更新一次达人榜单
     *
     * */
    async updateCompletionDegreeRankList() {
        let list = await this.ctx.model.TravelModel.CompletionDegreeRecord.find().sort({ weekCompletionDegree: -1, updateDate: 1 }).limit(travelConfig.Parameter.Get(travelConfig.Parameter.RANKNUMBER).value);
        let idx = 1;
        let date = new Date();
        list = list.map(l => {
            let o = {};
            o.uid = l.uid;
            o.completionDegree = l.weekCompletionDegree;
            o.rank = idx++;
            o.createDate = date;
            return o;
        });

        await this.ctx.model.TravelModel.CompletionDegreeRank.remove();
        await this.ctx.model.TravelModel.CompletionDegreeRank.insertMany(list);
        //刷新周记录
        await this.ctx.model.TravelModel.CompletionDegreeRecord.update({}, { $set: { weekCompletionDegree: 0 } }, { multi: true });
    }

    /**
     * 更新达人记录表
     * @param uid  require
     *
     * */
    async updateCompletionDegreeRecord(uid, cid) {
        let totalCityScenicspots = travelConfig.City.Get(cid).scenicspot.length;
        let totalCityPostcards = travelConfig.City.Get(cid).postcardnum;
        let totalCityEvents = travelConfig.City.Get(cid).eventnum;

        let userScenicspots = await this.ctx.model.TravelModel.Footprints.aggregate([
            { $match: { uid: uid, cid: cid } },
            { $group: { _id: "$scenicspot" } },
        ]);

        let userEvents = await this.ctx.model.TravelModel.SpotTravelEvent.aggregate([
            { $match: { uid: uid, cid: cid } },
            { $group: { _id: "$eid" } },
        ]);
        let userPostcards = await this.ctx.model.TravelModel.Postcard.aggregate([
            { $match: { uid: uid, cid: cid } },
            { $group: { _id: "$ptid" } },
        ]);
        let day = new Date().getDay() ? new Date().getDay() : 7;
        let thisMonday = moment().subtract(day, 'days');
        let weekUserScenicspots = await this.ctx.model.TravelModel.Footprints.aggregate([
            { $match: { uid: uid, cid: cid, createDate: { $gt: thisMonday } } },
            { $group: { _id: "$scenicspot" } },
        ]);

        let weekUserEvents = await this.ctx.model.TravelModel.SpotTravelEvent.aggregate([
            { $match: { uid: uid, cid: cid, createDate: { $gt: thisMonday } } },
            { $group: { _id: "$eid" } },
        ]);
        let weekUserPostcards = await this.ctx.model.TravelModel.Postcard.aggregate([
            { $match: { uid: uid, cid: cid, createDate: { $gt: thisMonday } } },
            { $group: { _id: "$ptid" } },
        ]);

        let userCityScenicspotsPro = userScenicspots.length / totalCityScenicspots * (travelConfig.Parameter.Get(travelConfig.Parameter.SCENICSPOTCOMPLETION).value / 100);
        let weekUserCityScenicspotsPro = weekUserScenicspots.length / totalCityScenicspots * (travelConfig.Parameter.Get(travelConfig.Parameter.SCENICSPOTCOMPLETION).value / 100);

        let userCityPostcardPro = userPostcards.length / totalCityPostcards * (travelConfig.Parameter.Get(travelConfig.Parameter.POSTCARDCOMPLETION).value / 100);
        let weekUserCityPostcardPro = weekUserEvents.length / totalCityPostcards * (travelConfig.Parameter.Get(travelConfig.Parameter.POSTCARDCOMPLETION).value / 100);

        let userCityEventPro = userEvents.length / totalCityEvents * (travelConfig.Parameter.Get(travelConfig.Parameter.EVENTCOMPLETION).value / 100);
        let weekUserCityEventPro = weekUserPostcards.length / totalCityEvents * (travelConfig.Parameter.Get(travelConfig.Parameter.EVENTCOMPLETION).value / 100);

        let progress = parseFloat((userCityScenicspotsPro + userCityPostcardPro + userCityEventPro).toFixed(1));
        let weekProgress = parseFloat((weekUserCityScenicspotsPro + weekUserCityPostcardPro + weekUserCityEventPro).toFixed(1));

        await this.ctx.model.TravelModel.CompletionDegreeRecord.update(
            { uid: uid, cid: cid },
            { $set: { uid: uid, cid: cid, completionDegree: progress, weekCompletionDegree: weekProgress, updateDate: new Date() } },
            { upsert: true }
            );
    }

    /**
     * 获取当前达人榜单
     * @page 页码
     * @param limit 查询条数
     * */
    async getCompletionDegreeRankList(page = 1, limit = travelConfig.Parameter.Get(travelConfig.Parameter.RANKNUMBER).value) {
        return await this.ctx.model.TravelModel.CompletionDegreeRank.find().skip((page - 1) * limit).limit(limit);
    }

    /**
     * 获取玩家在全国达人榜单中的排名
     * */
    async getUserCompletionDegreeRank(uid) {
        let rankInfo = await this.ctx.model.TravelModel.CompletionDegreeRank.findOne({ uid: uid });
        return rankInfo ? rankInfo.rank : 0; //0表示未上榜
    }

    /**
     * 获取玩家完成度
     * */
    async getUserCompletionDegree(uid) {
        return await this.ctx.model.TravelModel.CompletionDegreeRecord.findOne({ uid: uid });
    }
    /**
     * 获取当前好友达人榜单
     * @param friendList 好友列表
     * @param page 页码
     * @param limit 查询条数
     * */
    async getUserFriendCompletionDegreeRankList(friendList, page, limit) {
        return await this.ctx.model.TravelModel.CompletionDegreeRecord.find({ uid: friendList }).sort({ completionDegree: -1, updateDate: 1 }).skip((page - 1) * limit).limit(limit);
    }
    /**
     * 获取榜单奖励
     * @param type 榜单类别
     * @param rank 排名
     * */
     getReward(type, rank) {
        let ranks = travelConfig.ranks;
        if(type == apis.RankType.THUMBS) {
            for(let rankR of ranks) {
                if(rank <= rankR.ranking) {
                    return travelConfig.Rank.Get(rankR.id).doyenreward
                }
            }
        } else if(type == apis.RankType.FOOT) {
            for(let rankR of ranks) {
                if(rank <= rankR.ranking) {
                    return travelConfig.Rank.Get(rankR.id).trackreward
                }
            }
        }

        return 0;
    }


}


module.exports = RankService;