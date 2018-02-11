'use strict';

module.exports = appInfo => {
    const config = {};


    // add your config here
    config.mongoose = {
        url: 'mongodb://127.0.0.1:27017/test',
    };
    config.env="local";

    config.redis = {
        client: {
            host: '10.1.70.106',
            port: '6379',
            password: 'redis',
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
    config.noticeurl = "https://h5.ddz2018.com/action/shop.done";

    return config;
};
