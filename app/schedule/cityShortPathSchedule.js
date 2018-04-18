const Subscription = require('egg').Subscription;
const ShortPath = require("../service/pathService/shortPath");
const travelConfig = require("../../sheets/travel");



module.exports = app => {
    return {
        schedule: {
            type: 'worker', // all 指定所有的 worker 都需要执行
            cron: '0 0 0 * * 1',
            //immediate: true,           //app.config.env === 'prod', //配置了该参数为 true 时，这个定时任务会在应用启动并 ready 后立刻执行一次这个定时任务。
        },
        async task(ctx) {
            let citys = travelConfig.citys;
            for (let city of citys) {
                if (city.id != 10000) {
                    let short_path = new ShortPath(city.id);
                    let path = short_path.shortPath();
                    await ctx.model.TravelModel.CityShortPath.update({ cid: city.cid }, {
                        $set: {
                            cid: city.id,
                            shortestDistance: path.min,
                            minRoad: path.minRoad,
                        },
                    }, { upsert: true })
                }
            }
        },
    }
};