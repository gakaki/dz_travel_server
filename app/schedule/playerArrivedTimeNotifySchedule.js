const Subscription = require('egg').Subscription;

class PlayerArrivedTimeNotifySchedule extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            type: 'worker', // 一个 worker 执行
            interval: '60s',
            //immediate: true,
        };
    }

    // subscribe 是真正定时任务执行时被运行的函数
    async subscribe() {

         let min                  = 10 * 60 * 1000; //10分钟之前的离线用户
         let now                  = Date.now();
         let ago                  = now - min;
         let c                    = await this.config.REDISKEY;
         let needNotifyUserIds    = await this.app.redis.zrangebyscore(c.KEY_USER_ARRIVE_TIME, "-inf", ago );

         this.logger.info( " needNotifyUserIds " , needNotifyUserIds );

         for( let uid of needNotifyUserIds ){
             this.logger.info( " PlayerArrivedTimeNotifySchedule " , uid );
            let currentCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: uid });
            if(!currentCity) {
                continue;
            }
            let roadMap = currentCity.roadMap;
            let lastSpotIndex = Math.max(...roadMap.map(n => n.index));
            let lastSpot = roadMap.find(n => n.index == lastSpotIndex);
            if(!lastSpot) {
                continue;
            }
           // if(lastSpot.endtime && lastSpot.endtime <= now) {
                await this.ctx.service.weChatService.weChatService.sendTemplateMessage( uid ,{ cid: lastSpot.cid, spot: lastSpot.name});
          //  }
            //zrem 删除已发送的
            await this.app.redis.zrem(c.KEY_USER_ARRIVE_TIME,uid);
        }



    }
}

module.exports = PlayerArrivedTimeNotifySchedule;