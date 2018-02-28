const utils = require("../../utils/utils");

const constant = require("../../utils/constant");
const EnglishPlayer = require('../player/englishPlayer/englishPlayer');


module.exports = () => {
    return async (ctx, next) => {
        const {app, socket, logger, helper} = ctx;
        const query = socket.handshake.query;
        const id = socket.id;
        // 用户信息
        const {appName, _sid, uid} = query;
        const nsp = app.io.of(['/' + appName]);
        //   const rooms = [room];

     /*   let ui = await app.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            socket.emit(id, helper.parseMsg('deny', "the user has no login"));

            // 调用 adapter 方法踢出用户，客户端触发 disconnect 事件
            nsp.adapter.remoteDisconnect(id, true, err => {
                logger.error(err);
            });
            return;
        }*/

         let ui={
             uid:uid,
             character:{
                 ELO:utils.Rangei(1,1000,true)
             }
         };
        logger.info(ui.uid + ' connected');
        let player = null ;
        switch (appName){
            case constant.AppName.ENGLISH:
                player = new EnglishPlayer(socket, ui, constant.playerStatus.online, appName);
                break;
        }

        if(player == null ){
            socket.emit(id, helper.parseMsg('deny', "no app type"));

            // 调用 adapter 方法踢出用户，客户端触发 disconnect 事件
            nsp.adapter.remoteDisconnect(id, true, err => {
                logger.error(err);
            });
            return;
        }


        ctx.service.socketService.socketioService.setOnlineUser(appName, player);


        await next();
        logger.info(ui.uid + ' disconnection');
        //console.log(userId+ ' disconnection!');

        // ctx.service.socketService.socketio.delSocket(userId);
        ctx.service.socketService.socketioService.delUser(appName, ui.uid);
        ctx.service.publicService.matchingService.deleteUser(player, appName);
        let roomList = ctx.service.socketService.socketioService.getRoomList(appName);
        for(let roomId in roomList){
            for(let userId in roomList[roomId].userList){
                if(userId == ui.uid){
                    roomList[roomId].leaveRoom(userId);
                    if(roomList[roomId].userList.size == 0 || player.isInitiator){
                        ctx.service.socketService.socketioService.delRoom(appName,roomId);
                    }
                    nsp.adapter.clients([roomId], (err, clients) => {
                        app.logger.info('#leave', userId);
                        nsp.to(roomId).emit('someoneLeave', {
                            clients,
                            action: 'leave',
                            target: 'participator',
                            message: `User(${userId}) leaved.`,
                        });

                    });
                    break;
                }
            }
        }



    };
};
