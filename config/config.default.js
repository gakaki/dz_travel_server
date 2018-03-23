const fs = require("fs");

module.exports = appInfo => {
    const config = {};

    // use for cookie sign key, should change to your own and keep security
    config.keys = appInfo.name + '_1518087334696_5975';

    // add your config here
    config.session = {
        key: 'EGG_SESS',
        maxAge: 24 * 3600 * 1000, // 1 天
        httpOnly: true,
        encrypt: true,
    };

    // add your config here
    config.security = {
        csrf: {
            ignoreJSON: true, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
            ignore: "/user/shopdone/:appName",
        },
    };
    config.file = fs.readFileSync(__dirname + "/apiclient_cert.p12");


    config.middleware = ["routerControl"];
    return config;
};
