module.exports = appInfo => {
    const config = {};


    // add your config here
    config.mongoose = {
        url: 'mongodb://mongouser:' + encodeURIComponent("Mandao#dzhy@2018") + '@172.17.16.5:27017/wxsrv?authSource=admin',
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
        dir: "/root/server/appsrv/logs/server/"
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

    config.appid = "wx1c721a2e355de9ba";
    config.appsecret = "66de48a97a8959491ac4f16dfa10e45b";
    config.pubid = "wx4224663bb4f0ed80";
    config.pubmchid = "1494209122";
    config.pubkey = "shanghaidouziwangluokejigongsih5";
    config.payid = "wxfc983573261a5210";
    config.paykey = "shanghaidouziwangluokejigongsih5";
    config.paymchid = "1494209122";
    config.noticeurl = "https://h5t.ddz2018.com/weChat/shopdone";

    return config;
};
