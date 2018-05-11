// const Controller = require('egg').Controller;
//
// const constant = require("../../utils/constant");
// const MakeEvent = require("../../service/travelService/makeEvent");
//
// class HelpController extends Controller {
//
//     async refreshEvents(ctx) {
//
//         this.logger.info("refreshEvents");
//
//         //循环所有user
//         let t      = await this.ctx.model.TravelModel.CurrentCity.find({},{ uid:1 ,cid : 1});
//         for ( let r of t){
//             let uid = r['uid'];
//             let cid = r['cid'];
//
//
//             let para         = { cid : cid };
//             let f            = new MakeEvent(para);
//             await this.ctx.model.TravelModel.CityEvents.update({ uid: uid }, {
//                 $set : {
//                     uid    : uid,
//                     events : f.eventsFormat
//                 }
//             }, { upsert: true });
//         }
//     }
//
// }
//
// module.exports = UserController;
