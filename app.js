const travelConfig = require("./sheets/travel");

module.exports = app => {
    app.beforeStart(async () => {
        // 应用会等待这个函数执行完成才启动
        app.redis.setnx("travel_userid",1000);
       let ctx = app.createAnonymousContext();
       await ctx.model.TravelModel.FlyTicket.create({
           uid:"ov5W35W2g36wL8DPE9iCR7JlNoUU",
           isGive:1, //机票类型 0：买的 1：送的
           flyType:1, //机票类型    1 单人 2双人
           cid:'200',//目的地
           createDate:new Date()
       })

    });

};