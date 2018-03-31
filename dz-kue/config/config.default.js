'use strict';

/**
 * egg-kue default config
 * @member Config#kue
 * @property {String} SOME_KEY - some description
 */
exports.kue = {
	app : true,
	agent : false,
	client: {
		queuePrefix: 'q',
		redis: {         //建议这里改成一样配置不然每次要改2份麻烦死了
			port: 6379,
			host: '10.1.70.106',
			auth: 'redis',
			db: 1,
			// see https://github.com/mranney/node_redis#rediscreateclient
			options: {},
		}
	},
	// clients: {}
};
