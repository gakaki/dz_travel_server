//积分相关数据逻辑
const Service = require('egg').Service;
const sheets = require('../../../sheets/travel')

moudle.exports = class IntegralService extends Service {
    async getInfo(req, ui) {
        //积分
        req.integral = ui.items[sheets.Item.POINT] || 0;
        //积分排名

    }

    /**
     * 增加积分（通过奖励、事件等方式可获得积分）
     * @param uid 玩家uid
     * @param num 增加的数量
     * */
    async add(uid, num) {

    }

    /**
     * 更新一次积分榜单
     * */
    async updateRankList() {
        let list = await this.ctx.model.TravelModel.IntegralRecord.find().sort('-integral').limit(sheets.Parameter.MAXMESSAGE);
        let idx = 1;
        let date = new Date();
        list = list.map(l => {
            let o = Object.assign({}, l);
            o.rank = idx++;
            o.createDate = date;
            return o;
        })
        await this.ctx.model.TravelModel.IntegralRecord.remove();
        await this.ctx.model.TravelModel.IntegralRecord.create(list);
        
    }

    /**
     * 获取当前积分榜单
     * @param limit 查询条数
     * */
    async getRankList(fromRank, limit) {
        let ranklist = await this.ctx.model.TravelModel.IntegralRank.find().gt('rank', fromRank).limit(limit);
        return ranklist;
    }

    /**
     * 获取玩家在榜单中的排名
     * */
    async getUserRank(uid) {
        let rankInfo = await this.ctx.model.TravelModel.IntegralRank.findOne({uid: uid});
        return rankInfo ? rankInfo.rank : 0; //0表示未上榜
    }
}