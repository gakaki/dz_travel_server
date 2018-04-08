module.exports = appInfo => {
    const config = {};


    // add your config here
    config.mongoose = {
        url: 'mongodb://travel:'+encodeURIComponent('travel#h5group')+'@'+encodeURIComponent('dds-bp13164b905191a41176-pub.mongodb.rds.aliyuncs.com')+':3717/travel',
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
        dir: "/root/server/travel/logs/"
    };
    config.io = {
        namespace: {
            '/travel': {
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

    config.appid = "wx69595aa92bd81b00";
    config.appsecret = "5ab876c69ee81a4ca83e477ac1905008";
    config.pubid = "wx4224663bb4f0ed80";
    config.pubmchid = "1494209122";
    config.pubkey = "shanghaidouziwangluokejigongsih5";
    config.payid = "wxfc983573261a5210";
    config.paykey = "shanghaidouziwangluokejigongsih5";
    config.paymchid = "1494209122";
    config.noticeurl = "https://h5t.ddz2018.com/weChat/shopdone";

    config.weatherkey="e8c488c457f9402aa363b327009b9ac8";
    config.weatherusername="HE1804081525551353";

    return config;
};
