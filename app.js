
module.exports = app => {
    app.beforeStart(async () => {
        // 应用会等待这个函数执行完成才启动

        app.redis.setnx("global_userid",1000);

    });

};