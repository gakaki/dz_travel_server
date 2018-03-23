
const constant = require("../../utils/constant");


module.exports = () => {
    return async (ctx, next) => {
        const {app, socket, logger, helper} = ctx;
        const query = socket.handshake.query;
        const id = socket.id;
        // 用户信息
        const {appName, _sid,uid} = query;
      //  console.log(appName,_sId,uId);
        const nsp = app.io.of(['/english']);
      //  let appName,uid,_sid;

        logger.info("socket 链接 ：" + appName +","+_sid);

        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        //logger.info(JSON.stringify(ui));
        if (ui == null) {
            return;
        }
        logger.info("当前的uid ："+uid,"存储的uid ："+ui.uid);
        if(uid != ui.uid){
            return;
        }

        logger.info(ui.uid + ' connected');

        let season =ctx.service.englishService.englishService.getSeason();
        if(!ui.character.season[season]){
            await ctx.model.PublicModel.User.update({uid:ui.uid,appName:appName},{$set:{
                ["character.season."+season]:{
                    rank: 1,       //段位
                    star: 0,       //星星数
                    createTime:new Date().toLocaleString()
                }
                }});
            ui = await ctx.model.PublicModel.User.findOne({uid:ui.uid,appName:appName});
        }

        //  app.messenger.sendToAgent('refresh', obj);



        let p = await app.redis.hgetall(ui.uid);

        if (!p) {
            ctx.logger.info("需要初始化？？？");
           await this.ctx.service.redisService.redisService.init(ui);
        }



       // app.messenger.sendToApp('connection',{appName:appName,userInfo:ui});

        // ctx.service.socketService.socketioService.setOnlineUser(constant.AppName.ENGLISH, player);
      //  logger.info("设置socket");
         ctx.service.socketService.socketioService.setSocket(constant.AppName.ENGLISH, ui.uid,socket);

         socket.on('error',msg=>{
             logger.error(msg);
         });

        await next();

        logger.info(ui.uid + ' disconnection');
        let player = await app.redis.hgetall(ui.uid);
        if(Number(player.rid)){
            logger.info("还在房间里。准备离开 "+player.rid);
             ctx.service.englishService.roomService.leaveRoom(player.rid,ui);
        }
        let isExist = await app.redis.sismember("matchpool", ui.uid);
        if(isExist){
             app.redis.srem("matchpool", ui.uid)
        }
      //  app.redis.del(ui.uid);
      //  app.messenger.sendToApp('disconnection',{appName:appName,uid:ui.uid});
      //  app.messenger.sendToApp('leaveRoom',{appName:appName,uid:ui.uid});
      //  this.app.messenger.sendToApp('pkend', {appName: appName, rid: rid, leaveUid: uid});

    };
};
