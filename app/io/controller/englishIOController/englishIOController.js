const Controller = require('egg').Controller;
const EnglishRoom = require('../../room/englishRoom/englishRoom');
const constant = require("../../../utils/constant");
const utils = require("../../../utils/utils");
const englishConfigs = require("../../../../sheets/english");

class EnglishIOController extends Controller {

    async canmatch(){
        const {ctx, app} = this;
        const nsp = app.io.of('/english');
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] ||{};
        const {rankType} = message;
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            return;
        }
        let player = app.userList.has(appName)?app.userList.get(appName).get(ui.uid):null;
        if(!player){
            return;
        }
        let cost =englishConfigs.Stage.Get(rankType).goldcoins1;
        if(ui.items[englishConfigs.Item.GOLD] < cost){
            socket.emit("needGold",{
                code:constant.Code.NEED_ITEMS
            });
        }
       /* socket.emit("waiting",{
            code:constant.Code.OK,
            data:{
                cost:cost
            }
        });*/
    }


    async ranking() {
        const {ctx, app} = this;
        const nsp = app.io.of('/english');
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] ||{};
        const {rankType} = message;
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            return;
        }
        let player = app.userList.has(appName)?app.userList.get(appName).get(ui.uid):null;
        if(!player){
            return;
        }

        let cost =englishConfigs.Stage.Get(rankType).goldcoins1;
        if(ui.items[englishConfigs.Item.GOLD] < cost){
            socket.emit("needGold",{
                code:constant.Code.NEED_ITEMS
            });
        }

        player.setStatus(constant.playerStatus.ready);
        player.setRankType(rankType);


        app.messenger.sendToApp('refresh',{appName:constant.AppName.ENGLISH,refreshPlayer:player});


      //  setTimeout(function () {
        app.messenger.sendToApp('readyMatch',{appName:appName,player:ui.uid});
     //   },2000)

    }

    async cancelmatch(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            return;
        }
        let player = app.userList.has(appName)?app.userList.get(appName).get(ui.uid):null;
        if(!player){
            return;
        }

        socket.emit("cancelSuccess",{
            code:constant.Code.OK
        });
        app.messenger.sendToApp('matchFailed',{appName:constant.AppName.ENGLISH,uid:ui.uid,isCancel:true});
      //  app.messenger.sendToApp('refresh',{appName:constant.AppName.ENGLISH,refreshPlayer:player});
      /*  ctx.service.publicService.matchingService.mtachFinish(player,appName);
      */

    }

    async roundend(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {answer,type,score,totalScore,isRight,rid,wid,time} = message;
        const nsp=app.io.of("/english");
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            return;
        }
        let player = app.userList.has(appName)?app.userList.get(appName).get(ui.uid):null;
        if(!player){
            return;
        }
        let roomInfo =app.roomList.has(appName)?app.roomList.get(appName).get(rid):null;
        if(!roomInfo){
            return;
        }

        player.setScore(totalScore);
        player.setAnswer(answer);
        player.setResult(isRight);

        let englishAnswerRecord={
            uid:ui.uid,
            rid:rid,
            type:type, //题目类型
            answer:answer,
            score:score,
            isRight:isRight,
            wid:wid //单词id
        };
        ctx.model.EnglishModel.EnglishAnswerRecord.create(englishAnswerRecord);

        let dateStr = new Date().toLocaleDateString();
        let libArr =player.user.character.wordList[dateStr] || [];
        let lib = new Set(libArr);

        if(!lib.has(wid)){
            await ctx.model.PublicModel.User.update({uid:ui.uid,appName:appName},{$push:{["character.wordList."+dateStr]:wid}});
            let ui=await ctx.model.PublicModel.User.findOne({uid:ui.uid,appName:appName});
            player.setUser(ui);
        }

        ctx.app.messenger.sendToApp('refresh',{appName:constant.AppName.ENGLISH,refreshPlayer:player});

        let ulist=[];
        for(let player of roomInfo.userList.values()){
            ulist.push({
                info:player.user,
                score:player.score,
                continuousRight:player.continuousRight,
                playerAnswer:player.answer
            })
        }
          nsp.to(rid).emit('roundEndSettlement', {
              code:constant.Code.OK,
              data:{
                  userList:ulist,
              }
          });

        if(time == 5){
            app.messenger.sendToApp('pkend',{appName:appName,rid:rid,leaveUid:null});
        }

    }

/*    async pkend(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {rid,isLeave} = message;
        const nsp=app.io.of("/english");
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            return;
        }
        let player = app.userList.has(appName)?app.userList.get(appName).get(ui.uid):null;
        if(!player){
            return;
        }
        let roomInfo =app.roomList.has(appName)?app.roomList.get(appName).get(rid):null;
        if(!roomInfo){
            return;
        }








    }*/

    async createroom(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid} = query;

        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            return;
        }
        let player = app.userList.has(appName)?app.userList.get(appName).get(ui.uid):null;
        if(!player){
            return;
        }


        player.setInitiator();
        let rid = "11" + new Date().getTime();
       // let rid = "111111";
        let season =ctx.service.englishService.englishService.getSeason();
        let difficulty = englishConfigs.Stage.Get(player.user.character.season[season].rank).difficulty;
        let index = utils.Rangei(0,difficulty.length);

        socket.join(rid);
      //  englishRoom.joinRoom(player);

        app.messenger.sendToApp('createRoom',{appName:constant.AppName.ENGLISH,rid:rid,difficulty:difficulty[index]});
        app.messenger.sendToApp('refresh',{appName:constant.AppName.ENGLISH,refreshPlayer:player});
        app.messenger.sendToApp('joinRoom',{appName:constant.AppName.ENGLISH,uid:ui.uid,rid:rid});

      /*  let roominfo={
            userList:[
                {
                    info:player.user,
                    isInitiator:true

                }
            ],
            bystander:0,
            rid:rid,
            isFriend:true,
            roomStatus:constant.roomStatus.ready

        };*/
        socket.emit("createSuccess",{
            code:constant.Code.OK,
            data:{
                rid:rid
            }
        });
    }

    async joinroom() {
        const {ctx, app} = this;
        const socket = ctx.socket;
        const nsp = app.io.of('/english');
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {rid} = message;
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            return;
        }
        let player = app.userList.has(appName)?app.userList.get(appName).get(ui.uid):null;
        if(!player){
            return;
        }
        let roomInfo =app.roomList.has(appName)?app.roomList.get(appName).get(rid):null;
        if(!roomInfo){
            return;
        }

        if(!roomInfo.isFriend){
            return
        }

        socket.join(rid);
        app.messenger.sendToApp('joinRoom',{appName:constant.AppName.ENGLISH,uid:ui.uid,rid:rid});


        setTimeout(async function () {

            let userList=[];
            let roomMaster=[];

            for(let [uid,player] of roomInfo.userList.entries()){
                let user={
                    info :player.user,
                    isInitiator:player.isInitiator
                };
                userList.push(user);

                if(uid != ui.uid){
                    roomMaster = uid;
                }
            }

            await ctx.model.PublicModel.User.update({uid:ui.uid,appName:appName},{$addToSet:{["character.friendsList"]:roomMaster[0]}});
            await ctx.model.PublicModel.User.update({uid:roomMaster[0],appName:appName},{$addToSet:{["character.friendsList"]:ui.uid}});





            let rinfo={
                userList:userList,
                bystanderCount:roomInfo.bystander.size,
                rid:rid,
                isFriend:true,
                roomStatus:roomInfo.roomStatus
            };

            nsp.to(rid).emit("roomInfo",{
                code:constant.Code.OK,
                data:{
                    userList: userList,
                    roomInfo:rinfo
                }
            })
        },100);



    }

    async startgame(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const nsp = app.io.of('/english');
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {rid} = message;
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            return;
        }
        let player = app.userList.has(appName)?app.userList.get(appName).get(ui.uid):null;
        if(!player){
            return;
        }


        let roomInfo =app.roomList.has(appName)?app.roomList.get(appName).get(rid):null;
        if(!roomInfo){
            return;
        }

        if(roomInfo.isFriend){
            if(!player.isInitiator){
                return
            }
        }
    /*    nsp.to(rid).emit('joinSuccess', {
            code:constant.Code.OK,

        });*/
        let season = ctx.service.englishService.englishService.getSeason();
        let wordList=ctx.service.englishService.englishService.setQuestions(player.user.character.season[season].rank);
        roomInfo.setWordList(wordList);
        app.messenger.sendToApp('setRoom',{appName:constant.AppName.ENGLISH,room:roomInfo,isOver:false});

    //    setTimeout(function () {
            let userList=[];
            for(let player of roomInfo.userList.values()){
                let user={
                    info: player.user,
                    waitTime: player.waitTime,
                    isInitiator:player.isInitiator
                };
                userList.push(user);
            }

        nsp.to(rid).emit('matchSuccess', {
                code:constant.Code.OK,
                data:{
                    userList: userList,
                    roomInfo:roomInfo
                }
            });
    //    },100);


    }



    async leaveroom(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const nsp = app.io.of('/english');
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {rid} = message;
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            return;
        }
        let player = app.userList.has(appName)?app.userList.get(appName).get(ui.uid):null;

        if(!player){
            return;
        }
        let roomInfo =app.roomList.has(appName)?app.roomList.get(appName).get(rid):null;
        if(!roomInfo){
            return;
        }
        socket.leave(rid);
      //  let isbystander=true;
        //是否好友局
        app.messenger.sendToApp('leaveRoom',{appName:appName,uid:ui.uid});
    /*    if(roomInfo.isFriend){
            let dissolveFlag=false;
            if(roomInfo.roomStatus == constant.roomStatus.ready){
                //离开的人是当局者还是旁观者
                for(let player of roomInfo.userList.values()){
                    if(player.user.uid == ui.uid){
                        if(player.isInitiator){
                            dissolveFlag = true; //离开者为房主
                        }else{
                            isbystander = false;  //离开者为参与者
                        }
                        break;
                    }

                }
                //离开的是房主
                if(dissolveFlag){
                    //通知所有人房间已经解散
                    nsp.to(rid).emit('dissolve', {
                        code:constant.Code.OK,
                        data:{
                            dissolve:dissolveFlag
                        }
                    });
                    //其余人离开房间

                    app.messenger.sendToApp('delRoom',{appName:constant.AppName.ENGLISH,rid:rid});
                   // ctx.service.socketService.socketioService.delRoom(appName,rid);
                    return;
                }
                if(!isbystander){
                        app.messenger.sendToApp('exchange',{appName:constant.AppName.ENGLISH,rid:rid});
                        let userList=[];
                        for(let player of roomInfo.userList.values()){
                            let user={
                                info :player.user,
                                isInitiator:player.isInitiator
                            };
                            userList.push(user);
                        }
                        let rinfo={
                            userList:userList,
                            bystanderCount:roomInfo.bystander.size,
                            rid:rid,
                            isFriend:true,
                            roomStatus:roomInfo.roomStatus
                        };
                        nsp.to(rid).emit('roomInfo', {
                            code:constant.Code.OK,
                            data:{
                                userList:userList,
                                roomInfo:rinfo
                            }
                        });

                }

                return;
            }
        }*/
      //  player.gameFinish();
      //  app.messenger.sendToApp('refresh',{appName:constant.AppName.ENGLISH,refreshPlayer:player,isOver:true});


    }


    async getroominfo(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const nsp = app.io.of('/english');
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {rid} = message;
        ctx.logger.info("房间号 ："+rid);
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            return;
        }
        let player = app.userList.get(appName).get(ui.uid);

        if(!player){
            return;
        }
        let roomInfo = app.roomList.get(appName).get(rid);
        if(!roomInfo){
            return;
        }
        let userList=[];
        for(let player of roomInfo.userList.values()){
            let user={
                info :player.user,
                isInitiator:player.isInitiator
            };
            userList.push(user);
        }
        if(roomInfo.isFriend){
            // if(roomInfo.userList.size <2){
            //     app.messenger.sendToApp('exchange',{appName:constant.AppName.ENGLISH,rid:rid});
            // }


            let rinfo={
                userList:userList,
                bystanderCount:roomInfo.bystander.size,
                rid:rid,
                isFriend:true,
                roomStatus:roomInfo.roomStatus
            };

            nsp.to(rid).emit('roomInfo', {
                code:constant.Code.OK,
                data:{
                    userList:userList,
                    roomInfo:rinfo
                }
            });
        }else{
            nsp.to(rid).emit('pkInfo', {
                code:constant.Code.OK,
                data:{
                    userList:userList,
                    roomInfo:roomInfo
                }
            });
        }




    }

    async test(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const nsp = app.io.of('/english');
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {rid} = message;
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            return;
        }
        let player = app.userList.get(appName).get(ui.uid);

        if(!player){
            return;
        }
        let roomInfo = app.roomList.get(appName).get(rid);
        if(!roomInfo){
            return;
        }
       /* let roomId = "1";
        let englishRoom = new EnglishRoom(roomId,1,true);
        englishRoom.joinRoom(player);*/
       // socket.emit("roomInfo",englishRoom)
       //socket.join(roomId);
        nsp.to(rid).emit('roomInfo', {
            code:constant.Code.OK,
            data:{
                roomInfo:111
            }
        });
    }


}

module.exports = EnglishIOController;
