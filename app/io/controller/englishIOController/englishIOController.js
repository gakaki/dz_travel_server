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


        console.log("匹配楼。。。。。。。。。。。。。。");
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
        const {answer,type,score,totalScore,isRight,rid,wid} = message;
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

        let ulist={};
        for(let player of roomInfo.userList.values()){
            ulist[player.user.uid]={
                info:player.user,
                score:player.score,
                continuousRight:player.continuousRight,
                playerAnswer:player.answer
            }
        }
          nsp.to(rid).emit('roundEndSettlement', {
              code:constant.Code.OK,
              data:{
                  userList:ulist,
              }
          });

    }

    async pkend(){
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


        let result=roomInfo.gameover(ui.uid,roomInfo.isFriend,isLeave);


        let season = ctx.service.englishService.englishService.getSeason();
        let user = player.user;
        let rankType = player.rankType;

        let cost={
            ["character.experience.exp"] :result.exp,
            ["character.wins"] :result.wins,
            ["character.losses"] :result.losses,
            ["character.total"] :result.total,
            ["character."+season+".ELO"] :200*result.star,
            ["items."+englishConfigs.Item.GOLD] :result.gold
        };

        let winningStreak =user.character.winningStreak;
        let rank = user.character[season].rank;
        let star = user.character[season].star;
        let exp = user.character.experience.exp;
        let needExp = user.character.experience.needExp;
        let level = user.character.level;
        let time = new Date().toLocaleString();
        let up ={};
        //连胜统计
        if(!roomInfo.isFriend){
            if(result.wins>0){
                winningStreak ++;
            }else{
                winningStreak = 0;
            }
            up["character.winningStreak"]=winningStreak;

            if(rankType == user.character[season].rank){
                //段位统计
                if(star+result.star < 0 ){
                    star = 0;
                }else{
                    if(englishConfigs.Stage.Get(rank).star == (star+result.star)){
                        rank ++;
                        star = 0;
                    }else{
                        star =star+result.star;
                    }
                }

                up["character."+season+".rank"]=rank;
                up["character."+season+".star"]=star;
                up["character."+season+".createTime"]=time;
            }

            // socket.emit("rankResult",{
            //     code:constant.Code.OK,
            //     data:{
            //         rank:rank,
            //         star:star
            //     }
            // })
        }



        //等级统计
        if((exp+result.exp) == needExp){
            level ++;
            let awards =englishConfigs.Level.Get(level).award;
            needExp = englishConfigs.Speech.Get(level);
            for(let award of awards){
                cost ["items."+award] = 1;
            }
            cost ["character.level"] = 1;
            up["character.experience.needExp"]=needExp;
        }


        await ctx.model.PublicModel.User.update({uid:user.uid,appName:appName},{
            $set:up,
            $inc:cost,
        });


        let upUser=await ctx.model.PublicModel.User.findOne({uid:user.uid,appName:appName});
     //   console.log(ui);
        player.setUser(upUser);

        let englishPKRecord={
            uid:upUser.uid,
            season:season,
            score:player.score,
            continuousRight:player.continuousRight,
            right:player.right,
            mistake:player.mistake,
            startTime:player.startTime,
            waitTime:player.waitTime,
            isInitiator:player.isInitiator,
            isFriend:roomInfo.isFriend,
            answers:player.answers,
            opponent:result.challenger.user.uid,
            opponentScore:result.challenger.score,
            rid:rid,
            result: result.final,
        };
        ctx.model.EnglishModel.EnglishPKRecord.create(englishPKRecord);

        app.messenger.sendToApp('setRoom',{appName:constant.AppName.ENGLISH,room:roomInfo,isOver:true});
        app.messenger.sendToApp('refresh',{appName:constant.AppName.ENGLISH,refreshPlayer:player});


        let ulist={};
        for(let player of roomInfo.userList.values()){
          //  console.log(player);
            ulist[player.user.uid]={
                info:player.user,
                score:player.score,
                continuousRight:player.continuousRight,
                final:result.final
               // playerAnswer:player.answers
            }
        }



        nsp.to(rid).emit('pkEndSettlement', {
            code:constant.Code.OK,
            data:{
                userList:ulist,
                isFriend:roomInfo.isFriend
            }
        });

    }

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
        let isbystander=true;
        //是否好友局
        if(roomInfo.isFriend){
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
                    for(let [uid,player] of roomInfo.userList.entries()){
                        if(uid != ui.uid){
                            player.socket.leave(rid);
                        }
                    }
                    for (let bystander of roomInfo.bystander.values()){
                        bystander.socket.leave(rid);
                        break;
                    }
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
        }
        player.gameFinish();
        app.messenger.sendToApp('refresh',{appName:constant.AppName.ENGLISH,refreshPlayer:player,isOver:true});


        nsp.to(roomId).emit('someOneLeave', {
            code:constant.Code.OK,
            data:{
                uid:ui.uid
            }
        });

        if(roomInfo.userList.size == 0){
            app.messenger.sendToApp('delRoom',{appName:constant.AppName.ENGLISH,rid:rid});
        //    ctx.service.socketService.socketioService.delRoom(appName,rid);
        }
    }


    async getroominfo(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const nsp = app.io.of('/english');
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {rid} = message;
        console.log(rid);
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

        if(roomInfo.isFriend){
            if(roomInfo.userList.size <2){
                app.messenger.sendToApp('exchange',{appName:constant.AppName.ENGLISH,rid:rid});
            }
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
        }else{
            let userList=[];
            for(let player of roomInfo.userList.values()){
                let user={
                    info :player.user,
                    isInitiator:player.isInitiator
                };
                userList.push(user);
            }
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
