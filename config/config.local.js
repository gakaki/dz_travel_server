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
             // host: '10.1.70.106',
           host: '127.0.0.1',
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

    // ignoreJSON
    config.appid = "wx69595aa92bd81b00";
    config.appsecret = "5ab876c69ee81a4ca83e477ac1905008";
    config.pubid = "wx4224663bb4f0ed80";
    config.pubmchid = "1494209122";
    config.pubkey = "shanghaidouziwangluokejigongsih5";
    config.payid = "wxfc983573261a5210";
    config.paykey = "shanghaidouziwangluokejigongsih5";
    config.paymchid = "1494209122";
    config.noticeurl = "https://tt.ddz2018.com/weChat/shopdone";

    config.weatherkey = "bb9b54c2840d460baa731486dee8deff";
    config.weatherusername = "HE1804101712021052";

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
