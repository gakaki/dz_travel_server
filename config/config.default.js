const fs = require("fs");
const path = require('path')

module.exports = appInfo => {
    const config = {};

    config.env = "default";

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
            ignore: ["/weChat/shopdone/:appName","/wepub"]
        },
    };
    config.file = fs.readFileSync(__dirname + "/apiclient_cert.p12");


    config.middleware = ["routerGlobalUserOnlineRecord","routerControl"];


    config.REDISKEY = {
        KEY_USER_ARRIVE_TIME : 'arrive_time',


    }

    config.view = {
        root: path.join(appInfo.baseDir, 'app/public'),
        mapping: {
            '.html': 'nunjucks',
            '.js': 'assets',
            '.css': 'assets',
            '.txt': 'assets'
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
        mongoLogger: {
            file: path.join(appInfo.root, 'logs/debug/mongo.log'),
        },
        eventLogger: {
            file: path.join(appInfo.root, 'logs/debug/event.log'),
        },
    };

    config.appid = "wx69595aa92bd81b00";
    config.appsecret = "5ab876c69ee81a4ca83e477ac1905008";
    config.pubid = "wx4224663bb4f0ed80";
    config.pubsecret = "bc5fe79fbe136e9ca2521d0c5d66bd05";
    config.pubmchid = "1494209122";
    config.pubkey = "shanghaidouziwangluokejigongsih5";
    config.payid = "wxfc983573261a5210";
    config.paykey = "shanghaidouziwangluokejigongsih5";
    config.paymchid = "1494209122";
    // config.noticeurl = "https://tt.ddz2018.com/weChat/shopdone";
    config.noticeurl = "https://travel.ddz2018.com/weChat/shopdone";

    config.weatherkey = "bb9b54c2840d460baa731486dee8deff";
    config.weatherusername = "HE1804101712021052";

    config.wepubToken = "wxappPUBodaoh5";
    config.wepubASEKey = "BZ2AXtbkYoN2wr7K46os9WqfcoK6AhEin1QyDllK0Lo";

    config.proxy       = true;//用来做nginx支持
    config.isSlave     = false;//在nginx主从下配置 slave为true那么不会走egg schedule 一台做schedule就够了



    return config;
};
