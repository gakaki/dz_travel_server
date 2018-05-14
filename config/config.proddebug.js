module.exports = appInfo => {
    const config = {};
    config.env = "proddebug"; //这里所有配置都应该跟服务器

    config.mongoose = {
        //现网
        url: 'mongodb://travel:' + encodeURIComponent('travel#h5group') + '@' + encodeURIComponent('dds-bp1e2587818be0d41156-pub.mongodb.rds.aliyuncs.com') + ':3717/travel',
    };


    let config_redis = {
        host: '172.17.16.9',
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

    config.isSlave = true;
    console.log(" >>>  环境配置是 啥？！prodslave",config.redis);
    return config;
};
