module.exports = appInfo => {
    const config = {};


    // add your config here
    config.mongoose = {
        //预览
        url: 'mongodb://travel:' + encodeURIComponent('travel#h5group') + '@' + encodeURIComponent('dds-bp13164b905191a41176-pub.mongodb.rds.aliyuncs.com') + ':3717/travel',
        //现网
        //url: 'mongodb://travel:' + encodeURIComponent('travel#h5group') + '@' + encodeURIComponent('dds-bp1e2587818be0d41156-pub.mongodb.rds.aliyuncs.com') + ':3717/travel',
    };

    config.env = "prod";

    let config_redis = {
        host: '172.17.16.13',
        port: '6379',
        password: 'Douzihuyu2018',
        db: '0',
    };
    config.redis = {
        client: config_redis,
    };
    config.logger = {
        dir: "/root/server/travel/logs/",
    };

    // config.io = {
    //     namespace: {
    //         '/travel': {
    //             connectionMiddleware: [ 'connection' ],
    //             packetMiddleware: [],
    //         },
    //     },
    //     redis: config_redis,
    // };


    return config;
};
