const Subscription = require('egg').Subscription;
const ShortPath = require("../service/pathService/shortPath");
const travelConfig = require("../../sheets/travel");
class CityShortPathSchedule extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            type: 'worker', // 一个 worker 执行
            cron: '0 0 0 * * 1',
           // immediate: true,
        };
    }

    // subscribe 是真正定时任务执行时被运行的函数
    async subscribe() {
        let citys = travelConfig.citys;
        for(let city of citys) {
            if(city.id != 10000) {
                let short_path = new ShortPath(city.id);
                let path = short_path.shortPath();
                await this.ctx.model.TravelModel.CityShortPath.update({ cid: city.cid }, { $set: { cid: city.id, shortestDistance: path.min, minRoad: path.minRoad } }, { upsert: true })
            }

        }

    }
}

module.exports = CityShortPathSchedule;