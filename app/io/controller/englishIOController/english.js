const Controller = require('egg').Controller;

class englishIOController extends Controller {
    async joinRoom(){
        const { ctx, app } = this;
        const nsp = app.io.of('/english');
        const message = ctx.args[0] || {};
        const socket = ctx.socket;
        const client = socket.id;
        const query = socket.handshake.query;
        app.logger.info("english");
        //app.logger.info(query);
        const {uid ,roomId} = message;
        let rooms=[roomId];
        nsp.adapter.clients(rooms, (err, clients) => {
            // 追加当前 socket 信息到clients
            //   clients[uid] = socket;

            // 加入房间
            socket.join(roomId);


            app.logger.info('#online_join');
            app.logger.info(clients);

            // 更新在线用户列表

            nsp.to(roomId).emit('online', {
                clients,
                roomId:roomId,
                roomType:"english",
                action: 'join',
                target: 'participator',
                message: `User(${uid}) joined.`,
            });
        });
    }


}

module.exports = englishIOController;
