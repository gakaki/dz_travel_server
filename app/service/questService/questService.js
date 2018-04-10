const QuestRepoInstance = require("./QuestRepo");
const Service = require('egg').Service;
const utils = require("../../utils/utils");
const travelConfig  = require("../../../sheets/travel");
const apis           = require('../../../apis/travel');
const appUtil        = require("../../utils/constant");

class QuestService extends Service{
    async getEvent(row_id) {
        const row       =  QuestRepoInstance.find(row_id);
        this.logger.info(row.length);
        // this.logger.info('event_rows1', row);
        return row;
    }



    async enterspot(info) {
        //http://127.0.0.1:7001/tour/enterspot?sid=1000001&uid=1000001&spotId=100101&cid=1

        //获得对当前城市拍照次数
        let r                       = await this.ctx.model.TravelModel.CurrentCity.findOne({uid: info.uid ,sspid: info.spotId });
        if ( !r ) {
            info.code = appUtil.Code.NO_DB_ROW;
            info.submit();
            return;
        }
        let photographyCount        = parseInt(r['photographyCount']);
        let tourCount               = parseInt(r['tourCount']);
        let cfgSpot                 = travelConfig.Scenicspot.Get(info.spotId);
        if ( !cfgSpot ) {
            info.code = appUtil.Code.NO_CFG_ROW;
            return;
        }

        let spot                    = {
            season:     await this.ctx.service.publicService.thirdService.getSeason(),
            weather:    await this.ctx.service.publicService.thirdService.getWeather(),
            freePhoto: [photographyCount, 2],       //免费拍照次数
            freeSight: [tourCount, 2],  //免费观光次数
            picture:     cfgSpot.picture,
            description: cfgSpot.description
        };
        this.logger.info("进入景点");

        //获得触发的事件列表 当然是指景点的那些随机触发事件
        let events = await this.ctx.model.TravelModel.SpotTravelEvent.find({uid: info.uid ,cid: info.cid });
        let questList = [];
        for ( let row of events ) {

            let questRow = QuestRepoInstance.find(row["eid"]);
            questList.push({
                'time': row['createDate'],
                'id': questRow.id,
                "describe": questRow.describe,
                "gold_used": 5,
                "rewards": questRow.rewards
            });
        }

        info.spot      = spot;
        info.questList = questList;
        info.submit();
    }



    //下面的2个方法暂时不用
    // async kue_startEvent() {
    //     // 这里编写的是 随机事件 的触发代码
    //     // 轻量级消息队列Kue的一些使用总结 #15 https://github.com/xizhibei/blog/issues/15
    //     const kue_queue_random = 'kue_quest_random';
    //     app.kue.process(kue_queue_random, (job, done) => {
    //         console.log(job.data.to);
    //         done();
    //     });
    // }
    //

    // async kue_eventProcess() {
    //     //创建一条消息 然后保存到redis队列中
    //     app.kue.create(kue_queue_random, {
    //         title: 'welcome email for justin'
    //         , to: 'gdjyluxiaoyong@gmail.com'
    //         , template: 'welcome-email'
    //     }).delay(milliseconds)
    //     .priority('high').save( function(err){
    //         if( !err ) {
    //             console.log( job.id , "delay seconds is" , milliseconds);
    //         }
    //     })
    // }
}


module.exports = QuestService;