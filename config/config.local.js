const path = require("path");

module.exports = appInfo => {
    const config = {};


    // add your config here
    config.mongoose = {
        // url: 'mongodb://admin:h5group@10.1.70.106:27017/travel',
        url: 'mongodb://127.0.0.1:27017/travel',
    };

    config.env = "local";

    const config_redis = {
            host: '10.1.70.106',
            port: 6379,
            password: 'redis',
            db: '0',
    };

    config.redis = {
        client: config_redis
    };

    config.io = {
        namespace: {
            '/travel': {
                connectionMiddleware: ['connection'],
                packetMiddleware: [],
            },
        },
        redis: config_redis
    };

    config.debug = {
        eventRandomPercents:1,
        eventRandomTime:true

    };

    //事件队列
    config.kue =  {
        app : true,
        agent : false,
        client: {
            queuePrefix: 'q',
            redis: Object.assign( {},config_redis,{
                    auth: 'redis',
                    db: 1,
                    options: {},
                })
        },
    };

    //app.getLogger('debugLogger') / ctx.getLogger('debugLogger')
    config.customLogger =  {
        debugLogger: {
            file: path.join(appInfo.root, 'logs/debug/debug.log'),
        },
    };

    return config;
};
