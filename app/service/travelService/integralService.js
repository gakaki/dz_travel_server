//积分相关数据逻辑
const Service = require('egg').Service;
const sheets = require('../../../sheets/travel');
const apis = require('../../../apis/travel')


class IntegralService extends Service {
    async getInfo(res, ui) {
        //积分
        res.integral = ui.items[sheets.Item.POINT] || 0;
        //积分排名
        res.rank = await this.getUserRank(ui.uid);
        //本期积分商店售卖的物品,配置在数据库中
        res.shops = await this.ctx.model.TravelModel.ExchangeItem.find();
    }

    async exchangeDetail(res) {
        const pageLimit = 6;// 每页数据
        let list = await this.ctx.model.TravelModel.ExchangeRecord.aggregate()
            .skip(pageLimit * res.page)
            .limit(pageLimit)
            .group({nickName: "$nickName", avatarUrl: "$avatar",shopName: "$exName" });
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
            await integralRM.update({uid: uid}, {$set : {integral: all, updateDate: new Date()}}, {upsert: true});
        }
    }

    /**
     * 更新一次积分榜单
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
    async exchange(res, ui) {
        this.logger.info(`用户${ui.uid}姓名${ui.nickName}请求兑换物品`)
        if (!ui.tel) {
            res.code = apis.Code.NEED_ADDRESS;
            this.logger.info('未填地址，返回');
            return;
        }

        let item = sheets.Integralshop.Get(res.id);
        if (!item) {
            res.code = apis.Code.PARAMETER_NOT_MATCH;
            this.logger.info('找不到要兑换的物品，返回');
            return;
        }

        if (ui.items[sheets.Item.POINT] < item.integral) {
            res.code = apis.Code.NEED_INTEGRAL;
            this.logger.info('积分不足，返回');
            return;
        }

        await this.ctx.model.TravelModel.ExchangeRecord.create({
            uid: ui.uid,
            nickName: ui.nickName,
            avatar: ui.avatarUrl,
            exId: res.id,
            exName: item.name,
            integral: item.integral,
            tel: res.tel,
            addr: res.addr,
            sent: false,
            createDate: new Date()
        });

        this.logger.info(`用户${ui.uid}姓名${ui.nickName}成功兑换了物品${item.name}`);
    }


}

module.exports = IntegralService;