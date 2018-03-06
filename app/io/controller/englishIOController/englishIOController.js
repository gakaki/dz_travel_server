const Controller = require('egg').Controller;
const EnglishRoom = require('../../room/englishRoom/englishRoom');
const constant = require("../../../utils/constant");
const englishConfigs = require("../../../../sheets/english");

class EnglishIOController extends Controller {
    async ranking() {
        const {ctx, app} = this;
        const nsp = app.io.of('/english');
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const id = socket.id;
        const message = ctx.args[0] ||{};
        const {rankType} = message;

        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            return;
        }
        let player = ctx.service.socketService.socketioService.getUserList(appName, ui.uid);
        if(player==null){
            return;
        }

        let cost =englishConfigs.Stage.Get(rankType).goldcoins1;
        if(ui.items[englishConfigs.Item.GOLD] < cost){
            socket.emit("needGold",{
                code:constant.Code.NEED_ITEMS
            });

            return;
        }

        player.setStatus(constant.playerStatus.ready);
        player.setRankType(rankType);
        ctx.service.publicService.matchingService.readyMatch(player,appName);
        socket.emit("waiting",{
            code:constant.Code.FRIEND_APPLY,
            data:{
                cost:cost
            }
        })

    }

    async cancelmatch(){
        console.log("取消匹配");
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            return;
        }
        let player = ctx.service.socketService.socketioService.getUserList(appName, ui.uid);
        if(player==null){
            return;
        }
        ctx.service.publicService.matchingService.mtachFinish(player,appName);
        socket.emit("cancelSuccess",{
            code:constant.Code.OK
        })

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
        let player = ctx.service.socketService.socketioService.getUserList(appName, ui.uid);
        if(player==null){
            return;
        }
        let roomInfo = ctx.service.socketService.socketioService.getRoomList(appName,rid);
        if(roomInfo==null){
            socket.emit("roomNotExist ",{
                code:constant.Code.ROOM_EXPIRED
            });
            return;
        }


        player.setScore(totalScore);
        player.setAnswer(answer);
        player.setResult(isRight);
       // roomInfo.joinRoom(player);

        let englishAnswerRecord={
            uid:ui.uid,
            rid:rid,
            type:type,
            answer:answer,
            score:score,
            isRight:isRight,
            wid:wid

        };
        ctx.model.EnglishModel.EnglishAnswerRecord.create(englishAnswerRecord);
        let dateStr = new Date().toLocaleDateString();
        let libArr =player.user.character.wordList[dateStr] || [];
        let lib = new Set(libArr);

      //  console.log(roomInfo.userList);
        if(!lib.has(wid)){
            await ctx.model.PublicModel.User.update({uid:ui.uid,appName:appName},{$push:{["character.wordList."+dateStr]:wid}});
            let ui=await ctx.model.PublicModel.User.findOne({uid:ui.uid,appName:appName});
            player.setUser(ui);
        }

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
                 /* score:{
                      uid:uid,
                      totalScore:totalScore
                  }*/
              }
          });

    }

    async pkend(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {rid} = message;
        const nsp=app.io.of("/english");
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            return;
        }
        let player = ctx.service.socketService.socketioService.getUserList(appName, ui.uid);
        if(player==null){
            return;
        }
        let roomInfo = ctx.service.socketService.socketioService.getRoomList(appName,rid);
        if(roomInfo==null){
            socket.emit("roomNotExist ",{
                code:constant.Code.ROOM_EXPIRED
            });
            return;
        }

        let result=roomInfo.gameover(ui.uid,roomInfo.isFriend);

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
        const message = ctx.args[0] || {};
        const {} = message;
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            return;
        }
        let player = ctx.service.socketService.socketioService.getUserList(appName, ui.uid);
        if(player==null){
            return;
        }
        player.setInitiator();
        let rid = "11" + new Date().getTime();
        let season =ctx.service.englishService.englishService.getSeason();
        let difficulty = englishConfigs.Stage.Get(player.character[season].rank).difficulty;
        let index = utils.Rangei(0,difficulty.length);
        let englishRoom = new EnglishRoom(rid,difficulty[index],true);
        socket.join(rid);
        englishRoom.joinRoom(player);
        let roominfo={
            userList:{
                [ui.uid]:player.user
            },
            bystander:0,
            rid:rid,
            isFriend:true,
            roomStatus:constant.roomStatus.ready

        };
        socket.emit("createSuccess",roominfo);
    }

    async joinroom() {
        const {ctx, app} = this;
        const socket = ctx.socket;
        const nsp = app.io.of('/english');
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {rid} = message;
        let roomInfo = ctx.service.socketService.socketioService.getRoomList(appName, rid);
        if (!roomInfo) {
            socket.emit("roomNotExist ",{
                code:constant.Code.ROOM_EXPIRED
            });
            return;
        }
        if(!roomInfo.isFriend){
            return
        }

        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            return;
        }
        let player = ctx.service.socketService.socketioService.getUserList(appName, ui.uid);
        if(player==null){
            return;
        }


        socket.join(rid);
        roomInfo.joinRoom(player);
        let userList=[];
        let roomMaster;
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
        await ctx.model.PublicModel.User.update({uid:ui.uid,appName:appName},{$addToSet:{["character.friendsList"]:roomMaster}});
        await ctx.model.PublicModel.User.update({uid:roomMaster,appName:appName},{$addToSet:{["character.friendsList"]:ui.uid}});
        let rinfo={
            userList:userList,
            bystanderCount:roomInfo.bystander.size,
            rid:rid,
            isFriend:true,
            roomStatus:roomInfo.roomStatus
        };
        nsp.to(rid).emit("join",{
            code:constant.Code.OK,
            data:rinfo
        })
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
        let player = ctx.service.socketService.socketioService.getUserList(appName, ui.uid);
        if(player==null){
            return;
        }
        if(!player.isInitiator){
            return
        }
        let roomInfo = ctx.service.socketService.socketioService.getRoomList(appName, rid);
        if (!roomInfo) {
            socket.emit("roomNotExist ",{
                code:constant.Code.ROOM_EXPIRED
            });
            return;
        }
        if(!roomInfo.isFriend){
            return
        }
        roomInfo.startGame();
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
        let player = ctx.service.socketService.socketioService.getUserList(appName, ui.uid);
        if(player==null){
            return;
        }
        let roomInfo = ctx.service.socketService.socketioService.getRoomList(appName, rid);
        if (!roomInfo) {
            socket.emit("roomNotExist ",{
                code:constant.Code.ROOM_EXPIRED
            });
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
                    ctx.service.socketService.socketioService.delRoom(appName,rid);
                    return;
                }
                if(!isbystander){
                    for (let [uid,bystander] of roomInfo.bystander.entries()){
                        roomInfo.leaveBystander(uid);
                        roomInfo.joinRoom(bystander);
                        break;
                    }
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
                    data:rinfo
                });
                return;
            }

        }else{
            isbystander=false;
        }
        player.gameFinish();
        nsp.to(rid).emit('someoneLeave', {
            code:constant.Code.OK,
            data:{
                code:constant.Code.OK,
                data:{
                    info: player.user,
                    isInitiator:player.isInitiator,
                    isbystander:isbystander,
                    isFriend:roomInfo.isFriend
                }
            }
        });

        if(roomInfo.userList.size == 0){
            ctx.service.socketService.socketioService.delRoom(appName,rid);
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
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            return;
        }
        let player = ctx.service.socketService.socketioService.getUserList(appName, ui.uid);
        if(player==null){
            return;
        }
        let roomInfo = ctx.service.socketService.socketioService.getRoomList(appName, rid);
        if (!roomInfo) {
            socket.emit("roomNotExist ",{
                code:constant.Code.ROOM_EXPIRED
            });
            return;
        }
        if(!roomInfo.isFriend){
            return;
        }
        if(roomInfo.userList.size <2){
            for (let [uid,bystander] of roomInfo.bystander.entries()){
                roomInfo.leaveBystander(uid);
                roomInfo.joinRoom(bystander);
                break;
            }
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
            data:rinfo
        });

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
        let player = ctx.service.socketService.socketioService.getUserList(appName, ui.uid);
        if(player==null){
            return;
        }

        let roomId = "1";
        let englishRoom = new EnglishRoom(roomId,1,true);
        englishRoom.joinRoom(player);
       // socket.emit("roomInfo",englishRoom)
       socket.join(roomId);
        nsp.to(roomId).emit('roomInfo', {
            code:constant.Code.OK,
            data:{
                roomInfo:englishRoom
            }
        });
    }


}

module.exports = EnglishIOController;
