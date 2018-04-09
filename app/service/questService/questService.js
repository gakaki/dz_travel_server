const QuestRepoInstance = require("./QuestRepo");
const Service = require('egg').Service;
const utils = require("../../utils/utils");
const travelConfig = require("../../../sheets/travel");

class QuestService extends Service{
    async getEvent(row_id) {
        const row       =  QuestRepoInstance.find(row_id);
        this.logger.info(row.length);
        // this.logger.info('event_rows1', row);
        return row;
    }

    //获得具体的奖励描述 reward 字段
    async rewardDescription(eid){
        let row       = QuestRepoInstance.find(eid);
        let reward    = row['reward'];
        if( !reward ) return "";
        //1,100;5,203
        let items    = reward.split(";");
        let itemComments = [];
        /*
            1金币
            2时间
            3明信片：后面跟明信片id，明信片id填-1表示该城市随机特产明信片
            4特产：后面跟特产id，
            5积分
         */
        let kv =  {
            "1" :"金币",
            "2" :"时间",
            "3" :"明信",
            "4" :"特产",
            "5" :"积分"
        };
        // for(let item of items){
        //     let {type_id,count} = item.split(",")
        //     itemComments.push({
        //         kv[item] :
        //     })
        // }
        return kv;
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