module.exports = app => {
    const config = {};

    // add your config here
    config.mongoose = {
        //url: 'mongodb://wxsrv:wxsrv@10.1.70.106:27017/wxsrv',
         url: 'mongodb://127.0.0.1:27017/test',
        //url: 'mongodb://english:'+encodeURIComponent('Douzi#Xx@2017')+'@'+encodeURIComponent('dds-bp11161f4c3ea0a41862-pub.mongodb.rds.aliyuncs.com')+':3717/english',
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
            '/english': {
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





    config.appid="wx4cdb3cbd1248ee5e";
    config.appsecret="844c2d947f2fe69db5ad101fa9d4d871";

    config.pubid = "wx4224663bb4f0ed80";
    config.pubmchid = "1494209122";
    config.pubkey = "shanghaidouziwangluokejigongsih5";
    config.payid = "wxfc983573261a5210";
    config.paykey = "shanghaidouziwangluokejigongsih5";
    config.paymchid = "1494209122";
    config.noticeurl = "https://h5t.ddz2018.com/weChat/shopdone";

    return config;
};
