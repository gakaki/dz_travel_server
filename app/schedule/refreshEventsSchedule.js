const Subscription   = require('egg').Subscription;
const MakeEvent      = require("../service/travelService/makeEvent");
const moment        = require("moment");
class refreshEventsSchedule extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            type: 'worker', // 一个 worker 执行
            interval: '7000s',
            immediate: true,
        };
    }

    // subscribe 是真正定时任务执行时被运行的函数
    async subscribe() {
        if (this.config.isSlave) return;

        this.logger.info("refreshEvents");
        //循环所有user
        let t      = await this.ctx.model.TravelModel.CurrentCity.find({},{ uid:1 ,cid : 1});
        for ( let r of t){
            let uid = r['uid'];
            let cid = r['cid'];

            this.logger.info(cid);

            let para         = { cid : cid };
            let f            = new MakeEvent(para);
            let time         = new Date().getTime();
            let interval     = 1000;


            for ( let i =0 ;i <f.eventsFormat.length ; i++){
                f.eventsFormat[i].triggerDate       = time + 60 * 1000 * i;
                // console.log(f.eventsFormat[i].triggerDate);
                f.eventsFormat[i].triggerDateYHM    = moment(f.eventsFormat[i].triggerDate).format('YYYY-MM-DD HH:mm:ss');
            }

            let rowCount     = await this.ctx.model.TravelModel.CityEvents.update({ uid: uid }, {
                $set : {
                    uid    : uid,
                    cid    : cid,
                    events : f.eventsFormat,
                }
            });
            console.log(rowCount);
        }
    }

}

module.exports = refreshEventsSchedule;