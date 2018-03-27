const travelConfig = require("./sheets/travel");

module.exports = app => {
    app.beforeStart(async () => {
        // 应用会等待这个函数执行完成才启动
        app.redis.setnx("travel_userid",1000);
     //   let ctx = app.createAnonymousContext();
     // let we = (await ctx.service.publicService.thirdService.getWeather("北京")).now.text;
     //    let outw = 1;
     //    for(let wea of travelConfig.weathers){
     //        if(wea.weather == we){
     //            outw = wea.id;
     //            break;
     //        }
     //    }
     //
     //    console.log(we);
     //   console.log(outw);
    });

};