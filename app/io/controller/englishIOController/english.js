const constant=require("../../../utils/constant");

const Controller = require('egg').Controller;
const Player = require('./../../player/player');
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

    async ranking(){
        const { ctx, app } = this;
        const nsp = app.io.of('/english');
        const message = ctx.args[0] || {};
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const { appName, _sid,userId } = query;
        const {uid} = message;
        let player=ctx.service.socketService.socketio.getUserList(appName,userId);
        player.setStatus(constant.playerStatus.ready);
        ctx.service.socketService.socketio.setUser(appName,player);
        ctx.service.publicService.matching.readyMatch(player,appName);

       // let roomId=ctx.service.englishService.english.match(appName);
       /* nsp.adapter.clients(rooms, (err, clients) => {
            // 加入房间
            socket.join(roomId);

            // 更新在线用户列表

            nsp.to(roomId).emit('online', {
                clients,
                roomId:roomId,
                roomType:"english",
                action: 'join',
                target: 'participator',
                message: `User(${uid}) joined.`,
            });
        });*/

    }


}

module.exports = englishIOController;
