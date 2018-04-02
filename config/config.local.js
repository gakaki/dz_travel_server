module.exports = appInfo => {
    const config = {};


    // add your config here
    config.mongoose = {
        // url: 'mongodb://admin:h5group@10.1.70.106:27017/travel',
        url: 'mongodb://127.0.0.1:27017/travel',
    };
    config.env = "local";

    config.redis = {
        client: {
            host: '10.1.70.106',
            port: '6379',
            password: 'redis',
            db: '0',
        },
    };

    config.io = {
        namespace: {
            '/travel': {
                connectionMiddleware: ['connection'],
                packetMiddleware: [],
            },
        },
        redis: {
            host: '10.1.70.106',
            port: '6379',
            password: 'redis',
            db: '0',
        },
    };


    config.appid = "wx69595aa92bd81b00";
    config.appsecret = "5ab876c69ee81a4ca83e477ac1905008";
    config.pubid = "wx4224663bb4f0ed80";
    config.pubmchid = "1494209122";
    config.pubkey = "shanghaidouziwangluokejigongsih5";
    config.payid = "wxfc983573261a5210";
    config.paykey = "shanghaidouziwangluokejigongsih5";
    config.paymchid = "1494209122";
    config.noticeurl = "https://h5t.ddz2018.com/weChat/shopdone";

    //事件队列
    config.kue =  {
        app : true,
        agent : false,
        client: {
            queuePrefix: 'q',
            redis: {         //建议这里改成一样配置不然每次要改2份麻烦死了
                port: 6379,
                host: '10.1.70.106',
                auth: 'redis',
                password: 'redis',
                db: 1,
                // see https://github.com/mranney/node_redis#rediscreateclient
                options: {},
            }
        },
        // clients: {}
    };

    return config;
};
