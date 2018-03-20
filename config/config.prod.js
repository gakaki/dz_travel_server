module.exports = appInfo => {
    const config = {};


    // add your config here
    config.mongoose = {
        //url: 'mongodb://mongouser:' + encodeURIComponent("Mandao#dzhy@2018") + '@172.17.16.5:27017/wxsrv?authSource=admin',
        //url: 'mongodb://mongouser:' + encodeURIComponent("Douzi#Xx@2017") + '@172.17.16.3:27017/wxsrv?authSource=admin',
        url: 'mongodb://english:'+encodeURIComponent('Douzi#Xx@2017')+'@'+encodeURIComponent('dds-bp11161f4c3ea0a41862-pub.mongodb.rds.aliyuncs.com')+':3717/english',

    };

    config.env = "prod";

    config.redis = {
        client: {
            host: '127.0.0.1',
            port: '6379',
            password: 'Douzihuyu2018',
            db: '0',
        },
    };

    config.logger = {
        dir: "/root/server/english/logs/server/"
    };
    config.io = {
        namespace: {
            '/english': {
                connectionMiddleware: ['connection'],
                packetMiddleware: [],
            },
        },
        redis: {
            host: '127.0.0.1',
            port: '6379',
            password: 'Douzihuyu2018',
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
