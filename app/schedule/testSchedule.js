const Subscription = require('egg').Subscription;

const travelConfig = require("../../sheets/travel");
const s = require("../../sheets/scenicpos");
const shortPath = require("../service/pathService/shortPath");

class TestSchedule extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            type: 'worker', // 一个 worker 执行
            //每天23:30执行一次
            cron: '0 0 0 * * *',// s m h dayOfMonth month dayOfWeek; see http://eggjs.org/zh-cn/basics/schedule.html
            // interval: '3m'// 本地测试，每3分钟生成一次
             //immediate: false,
        };
    }

    // subscribe 是真正定时任务执行时被运行的函数
    async subscribe() {
       let citys = travelConfig.citys;
       for(let city of citys) {
           if(city.id != 10000 ){
               let short_path = new shortPath(city.id);
               let shortDistance = short_path.shortPath().min;
               await this.ctx.model.TravelModel.ShortPath.update({cid:city.id},{cid:city.id,short:shortDistance},{upsert:true})

           }

       }
    }
}

module.exports = TestSchedule;