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
        redis: {
            port: 6379,
            host: '10.1.70.106',
            auth: 'redis',
            db: 1,
            options: {
                // see https://github.com/mranney/node_redis#rediscreateclient
			}
		}
	},
	// clients: {}
};
