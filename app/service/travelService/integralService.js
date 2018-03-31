//积分相关数据逻辑
const Service = require('egg').Service;
const sheets = require('../../../sheets/travel');

class IntegralService extends Service {
    async getInfo(res, ui) {
        //积分
        res.integral = ui.items[sheets.Item.POINT] || 0;
        //积分排名
        res.rank = await this.getUserRank(ui.uid);
        //本期积分商店售卖的物品
        // res.shops = sheets.xxx;//暂时没配。。。
    }

    async exchangedetail(res) {
        let pageLimit = 6 //sheets.Parameter.Get(sheets.Parameter.xxxxx); //每页数据，等待策划配表
        let list = await this.ctx.model.TravelModel.ExchangeRecord.find().sort('-_id').skip(pageLimit * res.page).limit(pageLimit);//改为aggregate.....
        res.exchangeDetail = list;
    }

    /**
     * 增加积分（通过奖励、事件等方式可获得积分）
     * @param uid 玩家uid
     * @param num 增加的数量
     * */
    async add(uid, num) {
        let userModel = this.ctx.model.PublicModel.User;
        let ui = await userModel.findOne({uid: uid});
        if (ui) {
            let all = ui.items[sheets.Item.POINT];
            all += num;

            ui.items[sheets.Item.POINT] = all;

            //update user data
            await userModel.update({uid: uid}, {$set: {items: ui.items}});
            //update integral data
            let integralRM = this.ctx.model.TravelModel.IntegralRecord;
            await integralRM.update({uid: uid}, {$set : {integral: all}});
        }
    }

    /**
     * 更新一次积分榜单
     * */
    async updateRankList() {
        let list = await this.ctx.model.TravelModel.IntegralRecord.find().sort('-integral').limit(sheets.Parameter.Get(sheets.Parameter.RANKNUMBER).value);
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

    //兑换物品
    async exchange(id) {

    }
}

module.exports = IntegralService;