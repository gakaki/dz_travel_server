const Controller = require('egg').Controller;
const EnglishRoom = require('../../room/englishRoom/englishRoom');
const constant = require("../../../utils/constant");
const englishConfigs = require("../../../../sheets/english");

class EnglishIOController extends Controller {
    async ranking() {
        const {ctx, app} = this;
        const nsp = app.io.of('/english');
       // const message = ctx.args[0] || {};
        // const {uid} = message;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid, uid} = query;
        let player = ctx.service.socketService.socketioService.getUserList(appName, uid);
        player.setStatus(constant.playerStatus.ready);
        ctx.service.publicService.matchingService.readyMatch(player, appName);
    }

    cancelmatch(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid, uid} = query;
        let player = ctx.service.socketService.socketioService.getUserList(appName, uid);
        ctx.service.publicService.matchingService.mtachFinish(player,appName);

    }

    async roundend(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid, uid} = query;
        const message = ctx.args[0] || {};
        const {answer,type,score,totalScore,isRight,rid,wid} = message;
        const nsp=app.io.of("/english");
        let player = ctx.service.socketService.socketioService.getUserList(appName, uid);
        let roomInfo = ctx.service.socketService.socketioService.getRoomList(appName,rid);
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
            await ctx.model.PublicModel.User.update({uid:uid},{$push:{["character.wordList."+dateStr]:wid}});
            let ui=await ctx.model.PublicModel.User.findOne({uid:uid});
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
        const {appName, _sid, uid} = query;
        const message = ctx.args[0] || {};
        const {rid} = message;
        const nsp=app.io.of("/english");
        let roomInfo = ctx.service.socketService.socketioService.getRoomList(appName,rid);
        let player = ctx.service.socketService.socketioService.getUserList(appName, uid);
        let result=roomInfo.gameover(uid,roomInfo.isFriend);

        let season = ctx.service.englishService.englishService.getSeason();
        let user = player.user;
        let cost={
            ["character.experience.exp"] :result.exp,
            ["character.wins"] :result.wins,
            ["character.losses"] :result.losses,
            ["character.total"] :result.total,
            ["character."+season+".ELO"] :200*result.star,
            ["items.gold"] :result.gold
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

        //等级统计
        if((exp+result.exp) == needExp){
            level ++;
            needExp = englishConfigs.Speech.Get(level);
            cost ["character.level"] = 1;
        }

        await ctx.model.PublicModel.User.update({uid:uid,appName:appName},{
            $set:{
                ["character.winningStreak"]:winningStreak,
                ["character."+season+".rank"]:rank,
                ["character."+season+".star"]:star,
                ["character."+season+".createTime"]:time,
                ["character.experience.needExp"]:needExp,
            },
            $inc:cost,
        });


        let ui=await ctx.model.PublicModel.User.findOne({uid:uid,appName:appName});
     //   console.log(ui);
        player.setUser(ui);

        let englishPKRecord={
            uid:uid,
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

    createRoom(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid, uid} = query;
        const message = ctx.args[0] || {};
        const {isFriend} = message;
        if(isFriend){
            let rid = "1" + new Date().getTime();
            let englishRoom = new EnglishRoom(rid);
            socket.join(rid);
            let player=ctx.socketioService.socketioService.getUserList(appName,uid);
            englishRoom.joinRoom(player);
            socket.emit();
        }


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
