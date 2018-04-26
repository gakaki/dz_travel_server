//积分相关数据逻辑
const Service = require('egg').Service;
const sheets = require('../../../sheets/travel');
const apis = require('../../../apis/travel');
const utils = require('../../utils/utils');

class IntegralService extends Service {
    async getInfo(res, ui) {
        //积分
        res.integral = ui.items[sheets.Item.POINT] || 0;
        //积分排名
        res.rank = await this.ctx.service.travelService.rankService.getUserScoreRank(ui.uid);
        //本期积分商店售卖的物品,配置在数据库中
        let date = new Date().format("yyyy-MM-dd");
        let shops = await this.ctx.model.TravelModel.ExchangeItem.find();

        if(!shops.length && sheets.exchanges) {
            shops = sheets.exchanges
            for (let i = 0;i<shops.length;i++) {
                shops[i].uid = ui.uid;
                shops[i].createDate = new Date();
                shops[i].remaining = shops[i].num;
                shops[i].time1 = new Date(shops[i].time1);
                shops[i].time2 = new Date(shops[i].time2);
                shops[i].type = shops[i].type;
                await this.ctx.model.TravelModel.ExchangeItem.create(shops[i]);
            }
        }
        shops = shops.filter(v=>{
            return new Date() >= v.time1 && new Date() <= v.time2
        })
        res.shops = shops

    }

    async exchangeDetail(res) {
        const pageLimit = 10;// 每页数据
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
    async add(uid, num, type) {
        let userModel = this.ctx.model.PublicModel.User;
        let ui = await userModel.findOne({ uid: uid });
        if (ui) {
            let all = ui.items[sheets.Item.POINT];
            all += num;

            ui.items[sheets.Item.POINT] = all;

            //update user data
            //await userModel.update({uid: uid}, {$set: {items: ui.items}});
            this.ctx.service.publicService.itemService.itemChange(uid, { ["items." + sheets.Item.POINT]: num }, type);
            //update integral data
            let integralRM = this.ctx.model.TravelModel.IntegralRecord;
            await integralRM.update({uid: uid}, { $set: { integral: all, updateDate: new Date() } }, { upsert: true });
        }
    }

    //兑换物品
    async exchange(res, ui) {
        this.logger.info(`用户${ui.uid}姓名${ui.nickName}请求兑换物品`)
        // if (!ui.address) {
        //     res.code = apis.Code.NEED_ADDRESS;
        //     this.logger.info('未填地址，返回');
        //     return;
        // }

        let item = await this.ctx.model.TravelModel.ExchangeItem.findOne({id: res.id,remaining:{$gt:0}});
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
        let myRank = await this.ctx.service.travelService.rankService.getUserScoreRank(ui.uid);

        if (myRank > condition.rank) {
            res.code = apis.Code.RANK_NOT_MEET;
            return;
        }
        if (myIntegral < condition.integral) {
            res.code = apis.Code.INTEGRAL_NOT_MEET;
            return;
        }
        let result = await this.ctx.model.TravelModel.ExchangeItem.update({id: res.id,remaining:{$gt:0}},{$inc:{remaining:-1}});
        if(result.nModified){
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
            await this.ctx.service.publicService.itemService.itemChange(ui.uid, { ["items." + sheets.Item.POINT]: -item.integral }, '"integralExchange"');

        }else{
            res.code = apis.Code.COUNT_OVER;
            return;
        }


        this.logger.info(`用户${ui.uid}姓名${ui.nickName}成功兑换了物品${item.name}`);
    }

    async exchangeDeadline(info){
        let endtime = await this.ctx.model.TravelModel.ExchangeDeadline.findOne();
        if(!endtime) {
            this.logger.info('请在数据库中插入兑换活动的截止日期')
        } else {
            info.endtime = (endtime.endtime).format("yyyy-MM-dd")
        }
    }

}

module.exports = IntegralService;