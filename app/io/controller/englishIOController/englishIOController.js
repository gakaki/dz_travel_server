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
            socket.emit("loginFailed",{
                code:constant.Code.USER_NOT_FOUND
            });

            return;
        }
        let player = ctx.service.socketService.socketioService.getUserList(appName, ui.uid);
        if(player==null){
            socket.emit("loginFailed",{
                code:constant.Code.USER_NOT_FOUND
            });

            return;
        }
       /* let season = ctx.service.englishService.englishService.getSeason();
        let rank = ui.character.season;*/
        let cost =englishConfigs.Stage.Get(rankType).goldcoins1;
        if(ui.items[englishConfigs.Item.GOLD] < cost){
            socket.emit("needGold",{
                code:constant.Code.NEED_ITEMS
            });

            return;
        }

        player.setStatus(constant.playerStatus.ready);
        player.setRankType(rankType);
        ctx.service.publicService.matchingService.readyMatch(player, appName);
        socket.emit("waiting",{
            code:constant.Code.FRIEND_APPLY,
            data:{
                cost:cost
            }
        })
        /*let roomId = "1";
        let englishRoom = new EnglishRoom(roomId);
       // socket.emit("roomInfo",englishRoom)
       socket.join(roomId);
        nsp.to(roomId).emit('roomInfo', {
            code:constant.Code.OK,
            data:{
                roomInfo:englishRoom
            }
        });*/
    }

    async cancelmatch(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            socket.emit("loginFailed",{
                code:constant.Code.USER_NOT_FOUND
            });

            return;
        }
        let player = ctx.service.socketService.socketioService.getUserList(appName, ui.uid);
        if(player==null){
            socket.emit("loginFailed",{
                code:constant.Code.USER_NOT_FOUND
            });

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
            socket.emit("loginFailed",{
                code:constant.Code.USER_NOT_FOUND
            });

            return;
        }
        let player = ctx.service.socketService.socketioService.getUserList(appName, ui.uid);
        if(player==null){
            socket.emit("loginFailed",{
                code:constant.Code.USER_NOT_FOUND
            });

            return;
        }
        let roomInfo = ctx.service.socketService.socketioService.getRoomList(appName,rid);
        if(player==null){
            socket.emit("loginFailed",{
                code:constant.Code.USER_NOT_FOUND
            });

            return;
        }
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
            uid:uid,
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
            await ctx.model.PublicModel.User.update({uid:uid,appName:appName},{$push:{["character.wordList."+dateStr]:wid}});
            let ui=await ctx.model.PublicModel.User.findOne({uid:uid,appName:appName});
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
            socket.emit("loginFailed",{
                code:constant.Code.USER_NOT_FOUND
            });

            return;
        }
        let player = ctx.service.socketService.socketioService.getUserList(appName, ui.uid);
        if(player==null){
            socket.emit("loginFailed",{
                code:constant.Code.USER_NOT_FOUND
            });

            return;
        }
        let roomInfo = ctx.service.socketService.socketioService.getRoomList(appName,rid);

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

        //连胜统计
        if(result.wins>0){
            winningStreak ++;
        }else{
            winningStreak = 0;
        }
        let up ={
            ["character.winningStreak"]:winningStreak,


        };
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
            result: result.wins==1 ? true : false,
        };
        ctx.model.EnglishModel.EnglishPKRecord.create(englishPKRecord);


        let ulist={};
        for(let player of roomInfo.userList.values()){
          //  console.log(player);
            ulist[player.user.uid]={
                info:player.user,
                score:player.score,
                continuousRight:player.continuousRight,
               // playerAnswer:player.answers
            }
        }

        nsp.to(rid).emit('pkEndSettlement', {
            code:constant.Code.OK,
            data:{
                userList:ulist,
            }
        });

    }

    async createRoom(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {} = message;
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            socket.emit("loginFailed",{
                code:constant.Code.USER_NOT_FOUND
            });

            return;
        }
        let player = ctx.service.socketService.socketioService.getUserList(appName, ui.uid);
        if(player==null){
            socket.emit("loginFailed",{
                code:constant.Code.USER_NOT_FOUND
            });

            return;
        }
        let rid = "11" + new Date().getTime();
        let season =ctx.service.englishService.englishService.getSeason();
        let difficulty = englishConfigs.Stage.Get(player.character[season].rank).difficulty;
        let index = utils.Rangei(0,difficulty.length);
        let englishRoom = new EnglishRoom(rid,difficulty[index],true);
        socket.join(rid);
        englishRoom.joinRoom(player);
        socket.emit("createSuccess",{
            rid:rid
        });



    }

    joinroom() {
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid, uid} = query;
        const message = ctx.args[0] || {};
        const {rid} = message;
        let roomInfo = ctx.service.socketService.socketioService.getRoomList(appName, rid);
        let player=ctx.socketioService.socketioService.getUserList(appName,uid);
        if (!roomInfo) {
            return
        }
        socket.join(rid);
        roomInfo.joinRoom(player)
    }

    startgame(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid, uid} = query;
        const message = ctx.args[0] || {};
        const {rid} = message;

    }



    leaveroom(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid, uid} = query;
        const message = ctx.args[0] || {};
        const {rid} = message;
        let player = ctx.service.socketService.socketioService.getUserList(appName, uid);
        let roomInfo = ctx.service.socketService.socketioService.getRoomList(appName,rid);
        player.gameFinish();
        socket.leave(rid);
        roomInfo.leaveRoom(uid);
        if(roomInfo.userList.size == 0 || player.isInitiator){
            ctx.service.socketService.socketioService.delRoom(appName,rid);
        }

    }


}

module.exports = EnglishIOController;
