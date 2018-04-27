const Subscription = require('egg').Subscription;
const travelConfig = require("../../sheets/travel");
const apis = require("../../apis/travel");
class RewardRankSchedule extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            type: 'worker', // 一个 worker 执行
            //每天23:30执行一次
            cron: '0 0 0 * * 1', // s m h dayOfMonth month dayOfWeek; see http://eggjs.org/zh-cn/basics/schedule.html
            // interval: '3m'// 本地测试，每3分钟生成一次
            //immediate: true,
        };
    }

    // subscribe 是真正定时任务执行时被运行的函数
    async subscribe() {
        //获取达人榜
        let completionDegreeRankList = await this.ctx.service.travelService.rankService.getCompletionDegreeRankList();
        //发放奖励
        let context = travelConfig.Message.Get(travelConfig.Message.RANKMESSAGE).content;
        let createDate = new Date();
        for(let completionDegree of completionDegreeRankList) {
            let reward = this.ctx.service.travelService.rankService.getReward(apis.RankType.THUMBS, completionDegree.rank);
            this.ctx.service.publicService.itemService.itemChange(completionDegree.uid, { ["items." + travelConfig.Item.GOLD]: reward }, "rank");
            await this.ctx.model.TravelModel.UserMsg.create({
                uid: completionDegree.uid,
                mid: "msg" + travelConfig.Message.RANKMESSAGE + createDate.format("yyyyMMddhhmmss") + completionDegree.rank,
                type: travelConfig.Message.RANKMESSAGE,
                title: travelConfig.Message.Get(travelConfig.Message.RANKMESSAGE).topic,
                content: context.replace("b%", "达人").replace("s%", completionDegree.rank).replace("a%", reward),
                date: createDate,
            });
            await this.ctx.model.TravelModel.SysGiveLog.create({
                uid: completionDegree.uid,
                sgid: "sys" + apis.RankType.THUMBS + completionDegree.rank + new Date().getTime() , //唯一id
                type: apis.SystemGift.USERITEM, //类别    1 用户道具(金币，积分,飞机票) 2 特产 3.明信片 4 体验卡(豪华自驾车,舒适自驾车,经济自驾车,单反相机,高级单反相机,医药箱)
                iid: travelConfig.Item.GOLD.toString(), //赠送物品id    金币 1 积分 2 飞机票 11(单人票) ，12(双人票)  其余配表id
                number: reward, //数量
                isAdmin: "0", //管理员赠送  系统送的为0 (这一栏是为了后台手动送道具)
                createDate: createDate,
            })
        }
        //刷新周记录
        await this.ctx.model.TravelModel.CompletionDegreeRecord.update({}, { $set: { weekCompletionDegree: 0 } }, { multi: true });
        await this.ctx.model.TravelModel.CompletionDegreeCountryRecord.update({}, { $set: { weekCompletionDegree: 0 } }, { multi: true });
        let footRankList = await this.ctx.service.travelService.rankService.getFootRankList();
        let content = travelConfig.Message.Get(travelConfig.Message.RANKMESSAGE).content;
        for(let foot of footRankList) {
            let reward = this.ctx.service.travelService.rankService.getReward(apis.RankType.FOOT, foot.rank);
            this.ctx.service.publicService.itemService.itemChange(foot.uid, { ["items." + travelConfig.Item.GOLD]: reward }, "rank");
            await this.ctx.model.TravelModel.UserMsg.create({
                uid: foot.uid,
                mid: "msg" + travelConfig.Message.RANKMESSAGE + createDate.format("yyyyMMddhhmmss") + foot.rank,
                type: travelConfig.Message.RANKMESSAGE,
                title: travelConfig.Message.Get(travelConfig.Message.RANKMESSAGE).topic,
                content: content.replace("b%", "足迹").replace("s%", foot.rank).replace("a%", reward),
                date: createDate,
            });
            await this.ctx.model.TravelModel.SysGiveLog.create({
                uid: foot.uid,
                sgid: "sys" + apis.RankType.FOOT + new Date().getTime() + foot.rank, //唯一id
                type: apis.SystemGift.USERITEM, //类别    1 用户道具(金币，积分,飞机票) 2 特产 3.明信片 4 体验卡(豪华自驾车,舒适自驾车,经济自驾车,单反相机,高级单反相机,医药箱)
                iid: travelConfig.Item.GOLD.toString(), //赠送物品id    金币 1 积分 2 飞机票 11(单人票) ，12(双人票)  其余配表id
                number: reward, //数量
                isAdmin: "0", //管理员赠送  系统送的为0 (这一栏是为了后台手动送道具)
                createDate: createDate,
            })
        }
        //清空周记录
        await this.ctx.model.TravelModel.FootRecord.update({}, { $set: { weekLightCityNum: 0 } }, { multi: true });
    }
}

module.exports = RewardRankSchedule;