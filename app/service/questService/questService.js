// const QuestRepoInstance = require("./QuestRepo");
//
// const Service = require('egg').Service;
// const season = require('date-season')({north: true, autumn: true});
// const holiday = require('holiday.cn').default;
// const utils = require("../../utils/utils");
//
// class QuestService extends Service{
//     async getEvent(row_id) {
//         const row       =  QuestRepoInstance.find(row_id);
//         this.logger.info(row.length);
//         // this.logger.info('event_rows1', row);
//         return row;
//     }
//
//     async startEvent() {
//
//         // 这里编写的是 随机事件 的触发代码
//         // 轻量级消息队列Kue的一些使用总结 #15 https://github.com/xizhibei/blog/issues/15
//         const kue_queue_random = 'kue_quest_random';
//         app.kue.process(kue_queue_random, (job, done) => {
//             console.log(job.data.to);
//             done();
//         });
//     }
//
//     async eventProcess() {
//         //创建一条消息 然后保存到redis队列中
//         app.kue.create(kue_queue_random, {
//             title: 'welcome email for justin'
//             , to: 'gdjyluxiaoyong@gmail.com'
//             , template: 'welcome-email'
//         }).delay(milliseconds)
//         .priority('high').save( function(err){
//             if( !err ) {
//                 console.log( job.id , "delay seconds is" , milliseconds);
//             }
//         })
//     }
// }
//
//
// module.exports = QuestService;