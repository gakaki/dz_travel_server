const travelConfig  = require("./sheets/travel");
const utils         = require("./app/utils/utils");

module.exports = app => {
    app.beforeStart(async () => {
        // 应用会等待这个函数执行完成才启动
        app.redis.setnx("travel_userid",1000);
       let ctx = app.createAnonymousContext();
       await ctx.model.TravelModel.Postcard.create({
           uid:"ov5W35R-9V5h7f0gpZOJVNJuyabE",
           "cid" : "3",
           "country" : "中国",
           "province" : "上海",
           "city" : "上海",
           "ptid" : "100101",
           "pscid" : "001",
           type:'2',//明信片类型
           createDate:new Date()

       })
    // await ctx.model.TravelModel.TravelLog.create({
    //     uid:"ov5W35fZQbMq-5Np6fI1hcn_hfg8",
    //     date:new Date().format("yyyy-MM-dd"),//年月日
    //     city:'南京',
    //     rentCarType:0,
    //     scenicspot:'城隍庙',
    //     createDate:new Date()
    // })


    });

};