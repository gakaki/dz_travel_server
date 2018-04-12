const Subscription = require('egg').Subscription;
const travelConfig = require("../../sheets/travel");
const apis = require("../../apis/travel");
class UpdateRewardRankSchedule extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            type: 'worker', // 一个 worker 执行
            //每天23:30执行一次
            cron: '0 30 23 * * 7', // s m h dayOfMonth month dayOfWeek; see http://eggjs.org/zh-cn/basics/schedule.html
            // interval: '3m'// 本地测试，每3分钟生成一次
        };
    }

    // subscribe 是真正定时任务执行时被运行的函数
    async subscribe() {
        //更新达人榜
        let completionDegreeRankList = await this.ctx.service.travelService.rankService.updateCompletionDegreeRankList();
        //发放奖励
        let context = travelConfig.Message.Get(travelConfig.Message.RANKMESSAGE).content;
        let createDate = new Date();
        for(let completionDegree of completionDegreeRankList) {
            let reward = this.ctx.service.travelService.rankService.getReward(apis.RankType.THUMBS, completionDegree.rank);
            this.ctx.publicService.itemService.itemChange(completionDegree.uid, { ["items." + travelConfig.Item.GOLD]: reward });
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
                sgid: "sys" + new Date().getTime() + completionDegree.rank, //唯一id
                type: 1, //类别    1 用户道具(金币，积分,飞机票) 2 特产 3.明信片 4 体验卡(豪华自驾车,舒适自驾车,经济自驾车,单反相机,高级单反相机,医药箱)
                iid: travelConfig.Item.GOLD.toString(), //赠送物品id    金币 1 积分 2 飞机票 11(单人票) ，12(双人票)  其余配表id
                number: reward, //数量
                isAdmin: "0", //管理员赠送  系统送的为0 (这一栏是为了后台手动送道具)
                createDate: createDate,
            })
        }
    }
}

module.exports = UpdateRewardRankSchedule;