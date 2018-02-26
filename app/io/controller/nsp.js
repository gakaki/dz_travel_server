const Controller = require('egg').Controller;

class NspController extends Controller {
    async exchange() {
        const { ctx, app } = this;
        const nsp = app.io.of('/');
        const message = ctx.args[0] || {};
        const socket = ctx.socket;
        const client = socket.id;
        app.logger.info("========================");
        try {
            const { target, payload ,room} = message;
            if (!target) return;
            const msg = ctx.helper.parseMsg('exchange', payload, { client, target });
            nsp.emit(target, msg);
            nsp.to(room).emit()
        } catch (error) {
            app.logger.info("error");
            app.logger.error(error);
        }
    }
}

module.exports = NspController;
