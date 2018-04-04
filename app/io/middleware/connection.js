const utils = require("../../utils/utils");

const constant = require("../../utils/constant");



module.exports = () => {
    return async (ctx, next) => {
        const {app, socket, logger} = ctx;
        const query = socket.handshake.query;
        // 用户信息
        const {appName, sid, uid} = query;
        const nsp = app.io.of(['/' + appName]);

        logger.info('connected');


        await next();
        logger.info( 'disconnection');



    };
};
