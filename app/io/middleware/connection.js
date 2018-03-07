const utils = require("../../utils/utils");

const constant = require("../../utils/constant");
const EnglishPlayer = require('../player/englishPlayer/englishPlayer');
const userList=new Set();

module.exports = () => {
    return async (ctx, next) => {
        const {app, socket, logger, helper} = ctx;
        const query = socket.handshake.query;
        const id = socket.id;
        // 用户信息
        const {appName, _sid} = query;
      //  console.log(appName,_sId,uId);
        const nsp = app.io.of(['/english']);
      //  let appName,uid,_sid;

        logger.info("socket 链接 ：" + appName +","+_sid);

        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        //logger.info(JSON.stringify(ui));
        if (ui == null) {
            return;
        }

        logger.info(ui.uid + ' connected');


        //  app.messenger.sendToAgent('refresh', obj);

        app.messenger.sendToApp('connection',{appName:appName,userInfo:ui});

        // ctx.service.socketService.socketioService.setOnlineUser(constant.AppName.ENGLISH, player);
         ctx.service.socketService.socketioService.setSocket(constant.AppName.ENGLISH, ui.uid,socket);



        await next();

    /*    logger.info(ui.uid + ' disconnection');
        ctx.service.socketService.socketioService.delUser(appName, ui.uid);
        ctx.service.publicService.matchingService.deleteUser(player, appName);
        let roomList = ctx.service.socketService.socketioService.getRoomList(appName);
        for(let roomId in roomList){
            for(let userId in roomList[roomId].userList){
                if(userId == ui.uid){
                    if(roomList[roomId].userList.size == 0|| player.isInitiator){
                        ctx.service.socketService.socketioService.delRoom(appName,roomId);
                    }
                    nsp.adapter.clients([roomId], (err, clients) => {
                        app.logger.info('#leave', userId);
                        nsp.to(roomId).emit('someoneLeave', {
                            code:constant.Code.OK,
                            data:{
                                info: player.user,
                                isInitiator:player.isInitiator
                            }
                        });

                    });
                    break;
                }
            }
        }*/



    };
};
