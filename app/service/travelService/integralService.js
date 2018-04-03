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
            .sort('-_id')
            .skip(pageLimit * (res.page - 1))//page 从1开始
            .limit(pageLimit)
            .project({_id: 0, nickName: "$nickName", avatarUrl: "$avatar",shopName: "$exName" })
        ;
        res.exchangeDetail = list;
    }

    //test 生成兑换表
    async initExchangeDetails() {
        let uid = 'ov5W35VBNAwMJuhI3lsDq2yHD0cY';
        let date = new Date();
        let list = [];
        for (let i = 0; i < 100; i++) {
            let d = {
                uid:uid,
                nickName: '李世伟',
                avatar:"https://wx.qlogo.cn/mmopen/vi_32/PMBhv3gu5ug08XYj9XFICibs1WgQ0aP7mHPhFOj4l99GnwuPbtViagbc2PfFzudSsSla5m1ZmSqGSGJTXU32IcCQ/0",
                exId:i,
                integral: i * 10,
                exName:`测试物品${i}`,
                tel: 123456,
                addr: '上海',
                sent: false,
                createDate: date
            };
            list.push(d);
        }

        await this.ctx.model.TravelModel.ExchangeRecord.create(list);
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
        if (!ui.mobile) {
            res.code = apis.Code.NEED_ADDRESS;
            this.logger.info('未填地址，返回');
            return;
        }

        let item = await this.ctx.model.TravelModel.ExchangeItem.findOne({id: res.id});
        if (!item) {
            res.code = apis.Code.PARAMETER_NOT_MATCH;
            this.logger.info('找不到要兑换的物品，返回');
            return;
        }

        let myIntegral = ui.items[sheets.Item.POINT];

        if (myIntegral < item.integral) {
            res.code = apis.Code.NEED_INTEGRAL;
            this.logger.info('积分不足，返回');
            return;
        }

        let condition = await this.ctx.model.TravelModel.ExchangeCondition.findOne();
        if (!condition) {
            //还未配置兑换条件
            this.logger.warn(`还未配置兑换条件！！请到数据库exchangecondition表中插入一条，字段有rank和integral`);
            res.code = apis.Code.FAILED;
            return;
        }
        let myRank = await this.getUserRank(ui.uid);

        if (myRank > condition.rank) {
            res.code = apis.Code.RANK_NOT_MEET;
            return;
        }
        if (myIntegral < condition.integral) {
            res.code = apis.Code.INTEGRAL_NOT_MEET;
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

        await this.ctx.service.publicService.itemService.itemChange(ui, {["items." + sheets.Item.POINT]: item.integral});

        this.logger.info(`用户${ui.uid}姓名${ui.nickName}成功兑换了物品${item.name}`);
    }


}

module.exports = IntegralService;