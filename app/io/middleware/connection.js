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

        let season =ctx.service.englishService.englishService.getSeason();
        if(!ui.character.season[season]){
            await ctx.model.PublicModel.User.update({uid:ui.uid,appName:appName},{$set:{
                ["character.season."+season]:{
                    rank: 1,       //段位
                    star: 0,       //星星数
                    ELO: 0,        //等级分
                    createTime:new Date().toLocaleString()
                }
                }});
            ui = await ctx.model.PublicModel.User.findOne({uid:ui.uid,appName:appName});
        }

        //  app.messenger.sendToAgent('refresh', obj);

        app.messenger.sendToApp('connection',{appName:appName,userInfo:ui});

        // ctx.service.socketService.socketioService.setOnlineUser(constant.AppName.ENGLISH, player);
         ctx.service.socketService.socketioService.setSocket(constant.AppName.ENGLISH, ui.uid,socket);



        await next();

        logger.info(ui.uid + ' disconnection');

        app.messenger.sendToApp('disconnection',{appName:appName,uid:ui.uid});
        app.messenger.sendToApp('leaveRoom',{appName:appName,uid:ui.uid});


    };
};
