//测试服务器
module.exports = appInfo => {
    const config = {};
    config.env = "beta";
    config.mongoose = {
        //预览
        url: 'mongodb://travel:' + encodeURIComponent('travel#h5group') + '@' + encodeURIComponent('dds-bp13164b905191a41176-pub.mongodb.rds.aliyuncs.com') + ':3717/travel',
    };

    let config_redis = {
        host: '127.0.0.1',
        port: '6379',
        password: 'Douzihuyu2018',
        db: '0',
    };
    config.redis = {
        client: config_redis,
    };


    config.noticeurl = "https://tt.ddz2018.com/weChat/shopdone";
    config.isSlave = true;
    return config;
};

