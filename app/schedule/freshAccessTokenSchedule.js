const Subscription = require('egg').Subscription;

class FreshAccessTokenSchedule extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            type: 'worker', // 一个 worker 执行
            interval: '7000s',
        };
    }

    // subscribe 是真正定时任务执行时被运行的函数
    async subscribe() {
        this.ctx.service.weChatService.weChatService.freshAccess_token();

    }
}

module.exports = FreshAccessTokenSchedule;