const utils =require("../../utils/utils");

const constant =require("../../utils/constant");
const Player = require('../player/player');


module.exports = () => {
    return async (ctx, next) => {
        const { app, socket, logger, helper } = ctx;
        const query = socket.handshake.query;
        const id = socket.id;
        // 用户信息
        const { appName, _sid,userId } = query;
        const nsp = app.io.of(['/'+appName]);
     //   const rooms = [room];

      /*  let ui=await app.service.publicService.user.findUserBySid(_sid);
        if(ui==null){
            socket.emit(id, helper.parseMsg('deny', "the user has no login"));

            // 调用 adapter 方法踢出用户，客户端触发 disconnect 事件
            nsp.adapter.remoteDisconnect(id, true, err => {
                logger.error(err);
            });
            return;
        }*/

      let ui={
          uid:userId,
          character:{
              rank:utils.Rangei(1,1000,true)
          }
      };

        logger.info(ui.uid+ ' connected');
        let player = new Player(socket,ui,constant.playerStatus.online,appName);


        ctx.service.socketService.socketio.addUser(appName,player);



        await next();
        //console.log(userId+ ' disconnection!');

       // ctx.service.socketService.socketio.delSocket(userId);
        ctx.service.socketService.socketio.delUser(appName,ui.uid);

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
