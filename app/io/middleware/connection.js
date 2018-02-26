const PREFIX = 'room';
const Room = require('./../room/room');
const roomList={};
const userList={};

module.exports = () => {
    return async (ctx, next) => {
        const { app, socket, logger, helper } = ctx;
       /* const id = socket.id;
        const nsp = app.io.of('/');*/
        const query = socket.handshake.query;

        // 用户信息
        const { roomId ,appName, userId } = query;
        const nsp = app.io.of(['/'+appName]);
     //   const rooms = [room];

        logger.info(userId+ ' connected');
        ctx.service.socketService.socketio.setSocket(userId,socket);

        await next();
        console.log(userId+ ' disconnection!');

        ctx.service.socketService.socketio.delSocket(userId);
        ctx.service.socketService.socketio.delUser(appName,userId);

       /* nsp.adapter.clients(rooms, (err, clients) => {
            app.logger.info('#leave', userId);
            // 更新在线用户列表
            nsp.to(room).emit('online', {
                clients,
                action: 'leave',
                target: 'participator',
                message: `User(${userId}) leaved.`,
            });

        });*/


    };
};
