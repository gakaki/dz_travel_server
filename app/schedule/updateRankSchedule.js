const Subscription = require('egg').Subscription;

class UpdateRankSchedule extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            type: 'worker', // 一个 worker 执行
            //每天23:30执行一次
             cron: '0 0 0 * * *',// s m h dayOfMonth month dayOfWeek; see http://eggjs.org/zh-cn/basics/schedule.html
           // interval: '3m'// 本地测试，每3分钟生成一次
           // immediate: true,
        };
    }

    // subscribe 是真正定时任务执行时被运行的函数
    async subscribe() {
        this.ctx.service.travelService.rankService.updateScoreRankList();
        this.ctx.service.travelService.rankService.updateFootRankList();
        this.ctx.service.travelService.rankService.updateCompletionDegreeRankList();
    }
}

module.exports = UpdateRankSchedule;