
module.exports = app => {
    app.beforeStart(async () => {
        // 应用会等待这个函数执行完成才启动
        app.redis.setnx("travel_userid",1000);
       // let ctx = app.createAnonymousContext();
     // let we = await ctx.service.publicService.thirdService.getWeather("北京");
     //   console.log(we);
    });

};