const Service = require('egg').Service;
const travelConfig = require("../../../sheets/travel");

class RankService extends Service {
    /**
     * 更新一次积分榜单
     * */
    async updateScoreRankList() {
        let list = await this.ctx.model.TravelModel.IntegralRecord.find().sort({'integral':-1, 'updateDate':1}).limit(travelConfig.Parameter.Get(travelConfig.Parameter.RANKNUMBER).value);
        let idx = 1;
        let date = new Date();
        list = list.map(l => {
            let o = Object.assign({}, l);
            o.rank = idx++;
            o.createDate = date;
            return o;
        });

        await this.ctx.model.TravelModel.IntegralRank.remove();
        await this.ctx.model.TravelModel.IntegralRank.create(list);

    }

    /**
     * 获取当前全国积分榜单
     * @param page 页码
     * @param limit 查询条数
     * */
    async getScoreRankList( page,limit) {
        return await this.ctx.model.TravelModel.IntegralRank.find().skip((page-1)*limit).limit(limit);
    }

    /**
     * 获取玩家在榜单中的排名
     * */
    async getUserScoreRank(uid) {
        let rankInfo = await this.ctx.model.TravelModel.IntegralRank.findOne({uid: uid});
        return rankInfo ? rankInfo.rank : 0; //0表示未上榜
    }

    /**
     * 获取当前好友积分榜单
     * @param friendList 好友列表
     * @param page 页码
     * @param limit 查询条数
     * */
    async getUserFriendScoreRankList(friendList,page,limit){
        return  await this.ctx.model.TravelModel.IntegralRecord.find({uid:friendList}).sort({'integral':-1, 'updateDate':1}).skip((page-1)*limit).limit(limit);
    }


    /**
     * 更新一次达人榜单
     * */
    async updateCompletionDegreeRankList() {
        let list = await this.ctx.model.TravelModel.CompletionDegreeRecord.find().sort({"completionDegree":-1, "updateDate":1}).limit(travelConfig.Parameter.Get(travelConfig.Parameter.RANKNUMBER).value);
        let idx = 1;
        let date = new Date();
        list = list.map(l => {
            let o = Object.assign({}, l);
            o.rank = idx++;
            o.createDate = date;
            return o;
        });

        await this.ctx.model.TravelModel.CompletionDegreeRank.remove();
        await this.ctx.model.TravelModel.CompletionDegreeRank.create(list);

    }
    /**
     * 更新达人记录表
     * @param uid  require
     *
     * */
    async updateCompletionDegreeRecord( uid ) {
        let totalScenicspots = travelConfig.Scenicspot.length;
        let totalPostcards = travelConfig.Postcard.length;
        let totalEvents = travelConfig.Event.length;

        let userScenicspots = await this.ctx.model.TravelModel.Footprints.aggregate([
            {$match:{uid:uid}},
            {$group:{_id:"$scenicspot"}},
        ]);

        let userEvents = await this.ctx.model.TravelModel.SpotTravelEvent.aggregate([
            {$match:{uid:uid}},
            {$group:{_id:"$eid"}}
        ]);
        let userPostcards = await this.ctx.model.TravelModel.Postcard.aggregate([
            {$match:{uid:uid}},
            {$group:{_id:"$ptid"}}
        ]);

        let userProgress = userScenicspots.length * travelConfig.Parameter.Get(travelConfig.Parameter.SCENICSPOTCOMPLETION).value +
                              userPostcards.length * travelConfig.Parameter.Get(travelConfig.Parameter.POSTCARDCOMPLETION).value +
                                 userEvents.length * travelConfig.Parameter.Get(travelConfig.Parameter.EVENTCOMPLETION).value;

        let totalProgress =  totalScenicspots * travelConfig.Parameter.Get(travelConfig.Parameter.SCENICSPOTCOMPLETION).value +
                              totalPostcards * travelConfig.Parameter.Get(travelConfig.Parameter.POSTCARDCOMPLETION).value +
                              totalEvents * travelConfig.Parameter.Get(travelConfig.Parameter.EVENTCOMPLETION).value;
        let progress = parseFloat(((userProgress / totalProgress) * 100).toFixed(2));

        await this.ctx.model.TravelModel.CompletionDegreeRecord.update(
            {uid:uid},
            {$set:{uid:uid,scenicspots:userScenicspots.length,postcards:userPostcards.length,events:userEvents.length,completionDegree:progress,updateDate:new Date()}},
            {upsert:true}
            );
    }

    /**
     * 获取当前达人榜单
     * @page 页码
     * @param limit 查询条数
     * */
    async getCompletionDegreeRankList( page = 1, limit = 20) {
        return await this.ctx.model.TravelModel.CompletionDegreeRank.find().skip((page-1)*limit).limit(limit);
    }

    /**
     * 获取玩家在全国达人榜单中的排名
     * */
    async getUserCompletionDegreeRank(uid) {
        let rankInfo = await this.ctx.model.TravelModel.CompletionDegreeRank.findOne({uid: uid});
        return rankInfo ? rankInfo.rank : 0; //0表示未上榜
    }

    /**
     * 获取玩家完成度
     * */
    async getUserCompletionDegree(uid) {
        return await this.ctx.model.TravelModel.CompletionDegreeRecord.findOne({uid: uid});
    }
    /**
     * 获取当前好友达人榜单
     * @param friendList 好友列表
     * @param page 页码
     * @param limit 查询条数
     * */
    async getUserFriendCompletionDegreeRankList(friendList,page,limit){
        return  await this.ctx.model.TravelModel.CompletionDegreeRecord.find({uid:friendList}).sort({'completionDegree':-1, 'updateDate':1}).skip((page-1)*limit).limit(limit);
    }


}


module.exports = RankService;