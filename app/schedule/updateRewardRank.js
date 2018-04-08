const Subscription = require('egg').Subscription;
const travelConfig = require("../../sheets/travel");
const apis = require("../../apis/travel");
class UpdateRewardRank extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            type: 'worker', // 一个 worker 执行
            //每天23:30执行一次
            cron: '0 30 23 * * 7'// s m h dayOfMonth month dayOfWeek; see http://eggjs.org/zh-cn/basics/schedule.html
            // interval: '3m'// 本地测试，每3分钟生成一次
        };
    }

    // subscribe 是真正定时任务执行时被运行的函数
    async subscribe() {
        //更新达人榜
        let completionDegreeRankList = await this.ctx.service.travelService.rankService.updateCompletionDegreeRankList();
        //发放奖励
        let context =travelConfig.Message.Get(travelConfig.Message.RANKMESSAGE).content;
        let createDate = new Date();
        for(let completionDegree of completionDegreeRankList){
            let reward = this.ctx.service.travelService.rankService.getReward(apis.RankType.THUMBS,completionDegree.rank);
            this.ctx.publicService.itemService.itemChange(completionDegree.uid,{["items."+travelConfig.Item.Gold]:reward});
            await this.ctx.model.TravelModel.UserMsg.create({
                uid:completionDegree.uid,
                mid:"msg"+travelConfig.Message.RANKMESSAGE+createDate.format("yyyyMMddhhmmss")+completionDegree.rank,
                type:travelConfig.Message.RANKMESSAGE,
                title:travelConfig.Message.Get(travelConfig.Message.RANKMESSAGE).topic,
                content: context.replace("b%","达人").replace("s%",completionDegree.rank).replace("a%",reward),
                date:createDate
            })
        }
    }
}

module.exports = UpdateRewardRank;