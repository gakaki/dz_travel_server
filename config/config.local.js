const path = require("path");

module.exports = appInfo => {
    const config = {};
    config.env = "local";

    // add your config here
    config.mongoose = {
        url: 'mongodb://127.0.0.1:27017/travel',
    };


    const config_redis = {
            host: '10.1.70.106',
            port: 6379,
            password: 'redis',
            db: '0',
    };

    config.redis = {
        client: config_redis
    };

    // config.io = {
    //     namespace: {
    //         '/travel': {
    //             connectionMiddleware: ['connection'],
    //             packetMiddleware: [],
    //         },
    //     },
    //     redis: config_redis
    // };


    config.logger = {
        dir: "./logs/",
    };

    console.log(" >>>  环境配置是 啥？！local",config.redis);


    return config;
};
