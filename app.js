const mongoose = require("mongoose");
const sheets = require('./sheets/travel');
module.exports = app => {
    app.beforeStart(async () => {
        // 应用会等待这个函数执行完成才启动
        app.redis.setnx("travel_userid", 1000);
        mongoose.set('debug', true);

            // let shops = sheets.exchanges;
            // for (let i = 0; i < shops.length; i++) {
            //     shops[i].createDate = new Date();
            //     shops[i].remaining = shops[i].num;
            //     shops[i].time1 = new Date(shops[i].time1);
            //     shops[i].time2 = new Date(shops[i].time2);
            //     shops[i].codes = shops[i].code || [];
            //    await app.model.TravelModel.ExchangeItem.update({id:shops[i].id},{$set: shops[i]},{upsert:true});
            // }
    });

};