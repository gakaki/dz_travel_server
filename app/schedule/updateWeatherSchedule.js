const travelConfig = require("../../sheets/travel");
const weather = require("../utils/weather");
const utils = require("../utils/utils");
const moment = require("moment");

module.exports = {
    schedule: {
        cron: "0 0 */12 * * * ",      //秒(0-59)，分(0-59)，时(0-23)，日(1-31)，月(1-12)，周(0-7,0和7代表周日)
        cronOptions: { currentDate: new Date('2018-04-10 13:24:00') },
        type: 'worker', // all 指定所有的 worker 都需要执行
       // interval: '1m', //2个小时
      //  disable: moment([ new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate(), 11, 37, 0 ]) <= moment(),
       // immediate: true, //配置了该参数为 true 时，这个定时任务会在应用启动并 ready 后立刻执行一次这个定时任务。
    },
    async task(ctx) {
        ctx.logger.info("每两个小时更新一次天气");
       let citys = travelConfig.citys;
        let segment = 100;
        let weathers = "晴";
        for(let city of citys) {
            let key = "weather" + Math.round(city.id / segment);
            try {
                let meteorological = await weather(city.city, ctx.app);
                weathers = meteorological.now.cond_txt;
            }catch(err) {
                 ctx.logger.error(err);
                 return;
            }

            let map = {
              [city.id]: weathers,
            };

            await ctx.app.redis.hmset(key, map);
        }
    },
};