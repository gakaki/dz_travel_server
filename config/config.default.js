const fs = require("fs");
const path = require('path')

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
          //  ignoreJSON: true, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
            ignore: "/weChat/shopdone/:appName",
        },
    };
    config.file = fs.readFileSync(__dirname + "/apiclient_cert.p12");


    config.middleware = ["routerGlobalUserOnlineRecord","routerControl"];


    config.REDISKEY = {
        KEY_USER_ARRIVE_TIME : 'arrive_time',


    }

    config.view = {
        mapping: {
            '.html': 'nunjucks',
            '.js': 'assets',
            '.css': 'assets'
        }
    };

    config.assets = {
        publicPath: '/public/',
        devServer: {
            port: 8000,
            env: {
                BROWSER: 'none',
                ESLINT: 'none',
                SOCKET_SERVER: 'http://127.0.0.1:8000',
                PUBLIC_PATH: 'http://127.0.0.1:8000',
            },
            debug: true
        }
    }

    //app.getLogger('debugLogger') / ctx.getLogger('debugLogger')
    config.customLogger =  {
        debugLogger: {
            file: path.join(appInfo.root, 'logs/debug/debug.log'),
        },
    };
    return config;
};
