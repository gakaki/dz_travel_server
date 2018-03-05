const utils = require("../../utils/utils");

const constant = require("../../utils/constant");
const EnglishPlayer = require('../player/englishPlayer/englishPlayer');


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
        logger.info(JSON.stringify(ui));
        if (ui == null) {
            socket.emit("loginFailed", {
                code:constant.Code.USER_NOT_FOUND
            });
            return;
        }

        logger.info(id + ' connected');
        let player = null ;
        switch (appName){
            case constant.AppName.ENGLISH:
                player = new EnglishPlayer(socket, ui, constant.playerStatus.online, appName);
                break;
        }

        if(player == null ){
            socket.emit("appFailed ", {
                code:constant.Code.VERIFY_FAILED
            });
            return;
        }

        ctx.service.socketService.socketioService.setOnlineUser(appName, player);


        //   const rooms = [room];
        //console.log(socket);
        /*socket.on('init',async msg => {
           _sid = msg._sid;
            appName = msg.appName;
            uid = msg.uid;
            logger.info("socket 链接 ：" + appName +","+_sid);

            let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
            logger.info(JSON.stringify(ui));
            if (ui == null) {
                socket.emit("test", "hello");
                return;
            }
            /!*
                    let ui=await ctx.model.PublicModel.User.findOne({uid:uid});
                    let dateStr=new Date().toLocaleDateString();
                    if(ui == null){
                        let u={
                            uid:uid,
                            appName:appName,
                            character:{
                                level: 0,      //等级
                                rank: 1,       //段位
                                star: 0,       //星星数
                                ELO: 0,        //等级分
                                experience: 0,  //经验值
                                winningStreak: 0, //连胜场数
                                wins:0,            //胜场
                                losses:0,            //负场
                                total:0,             //总局数
                                cumulativeDays:0, //累计天数
                                beautifulWords:"welcome to english world", //每日美句
                                friendsList: ["aaaaaaaa","VTH7jgb-67MClPGDAAAC"], //好友列表
                                wordList:{
                                    [dateStr]:[],
                                }, //单词列表
                            },
                            items:{
                                gold:0
                            }
                        };

                        await ctx.model.PublicModel.User.create(u);
                         ui=await ctx.model.PublicModel.User.findOne({uid:uid});
                    }
            *!/

            logger.info(id + ' connected');
            let player = null ;
            switch (appName){
                case constant.AppName.ENGLISH:
                    player = new EnglishPlayer(socket, ui, constant.playerStatus.online, appName);
                    break;
            }

            if(player == null ){
                socket.emit("test", "hello");
                return;
            }

            ctx.service.socketService.socketioService.setOnlineUser(appName, player);
        });*/



        await next();

        logger.info(ui.uid + ' disconnection');

        // ctx.service.socketService.socketio.delSocket(userId);
        ctx.service.socketService.socketioService.delUser(constant.AppName.ENGLISH, ui.uid);
      //  let player=ctx.service.socketService.socketioService.getUserList(constant.AppName.ENGLISH, id);
        ctx.service.publicService.matchingService.deleteUser(player, constant.AppName.ENGLISH);
        let roomList = ctx.service.socketService.socketioService.getRoomList(constant.AppName.ENGLISH);
        for(let roomId in roomList){
            for(let userId in roomList[roomId].userList){
                if(userId == ui.uid){
                    roomList[roomId].leaveRoom(userId);
                    if(roomList[roomId].userList.size == 0 || player.isInitiator){
                        ctx.service.socketService.socketioService.delRoom(constant.AppName.ENGLISH,roomId);
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
