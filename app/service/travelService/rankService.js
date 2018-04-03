const Service = require('egg').Service;


class RankService extends Service {
    /**
     * 更新一次积分榜单
     * */
    async updateScoreRankList() {
        let list = await this.ctx.model.TravelModel.IntegralRecord.find().sort('-integral, updateDate').limit(sheets.Parameter.Get(sheets.Parameter.RANKNUMBER).value);
        let idx = 1;
        let date = new Date();
        list = list.map(l => {
            let o = Object.assign({}, l);
            o.rank = idx++;
            o.createDate = date;
            return o;
        })

        await this.ctx.model.TravelModel.IntegralRank.remove();
        await this.ctx.model.TravelModel.IntegralRank.create(list);

    }

    /**
     * 获取当前积分榜单
     * @param limit 查询条数
     * */
    async getScoreRankList(fromRank, limit) {
        let ranklist = await this.ctx.model.TravelModel.IntegralRank.find().gt('rank', fromRank).limit(limit);
        return ranklist;
    }

    /**
     * 获取玩家在榜单中的排名
     * */
    async getUserScoreRank(uid) {
        let rankInfo = await this.ctx.model.TravelModel.IntegralRank.findOne({uid: uid});
        return rankInfo ? rankInfo.rank : 0; //0表示未上榜
    }
    /**
     * 更新一次达人榜单
     * */
    async updateRankList() {
        let list = await this.ctx.model.TravelModel.IntegralRecord.find().sort('-integral, updateDate').limit(sheets.Parameter.Get(sheets.Parameter.RANKNUMBER).value);
        let idx = 1;
        let date = new Date();
        list = list.map(l => {
            let o = Object.assign({}, l);
            o.rank = idx++;
            o.createDate = date;
            return o;
        })

        await this.ctx.model.TravelModel.IntegralRank.remove();
        await this.ctx.model.TravelModel.IntegralRank.create(list);

    }




}


module.exports = RankService;