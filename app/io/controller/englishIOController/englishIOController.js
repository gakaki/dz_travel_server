const Controller = require('egg').Controller;
const EnglishRoom = require('../../room/englishRoom/englishRoom');
const constant = require("../../../utils/constant");

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

    roundend(){
        const {ctx, app} = this;
        const query = socket.handshake.query;
        const {appName, _sid, uid} = query;
        const message = ctx.args[0] || {};
        const {answer,gameType,score,totalScore,isRight,roomId,turn} = message;
        const nsp=app.io.of("/english");
        let player = ctx.service.socketService.socketioService.getUserList(appName, uid);
        let roomInfo = ctx.service.socketService.socketioService.getRoomList(appName,roomId);
        player.setScore(totalScore);
        player.setAnswer(answer);
        player.setResult(isRight);
        roomInfo.joinRoom(player);
        let englishAnswerRecord={
            uid:uid,
            roomId:roomId,
            gameType:gameType,
            answer:answer,
            score:score,
            isRight:isRight,
            word:roomInfo.wordList[turn]

        };
        ctx.model.EnglishModel.EnglishAnswerRecord.create(englishAnswerRecord);

        nsp.to(roomId).emit('roundend', {
            userList: userList,
            roomType: "english",
            action: 'join',
            target: 'participator',
        });

    }

    async pkend(){
        const {ctx, app} = this;
        const query = socket.handshake.query;
        const {appName, _sid, uid} = query;
        const message = ctx.args[0] || {};
        const {roomId,isFriend} = message;
        const nsp=app.io.of("/english");
        let roomInfo = ctx.service.socketService.socketioService.getRoomList(appName,roomId);
        let player = ctx.service.socketService.socketioService.getUserList(appName, uid);
        let result=roomInfo.gameover(uid,isFriend);

        let user = player.user;
        let cost={
            ["character.experience"] :result.exp,
            ["character.star"] :result.star,
            ["character.wins"] :result.wins,
            ["character.losses"] :result.losses,
            ["character.total"] :result.total,
            ["character.ELO"] :200*result.star
        };
        let item ={
            ["item.gold"] :result.gold
        };
        let winningStreak =0;
        let rank = user.character.rank;
        let exp = user.character.experience;
        if(result.wins>0){
            winningStreak = user.character.winningStreak ++;
        }

        if(result.star >5){
            rank = "黄金";
        }
        if((exp+result.exp) == 100){
            cost ["character.level"] =1;
        }
        await ctx.model.PublicModel.User.update({uid:uid,appName:appName},{
            $set:{winningStreak:winningStreak,rank:rank},
            $inc:{item,cost}
        });
        let ui=await ctx.model.PublicModel.User.findOne({uid:uid,appName:appName});
        player.setUser(ui);

        let englishPKRecord={
            uid:uid,
            score:player.score,
            continuousRight:player.continuousRight,
            right:player.right,
            mistake:player.mistake,
            startTime:player.startTime,
            waitTime:player.waitTime,
            isInitiator:player.isInitiator,
            isFriend:isFriend,
            opponent:result.challenger.user.uid,
            opponentScore:result.challenger.score,
            roomId:roomId,
            result: result.wins==1 ? true : false,
        };
        ctx.model.EnglishModel.EnglishPKRecord.create(englishPKRecord);

        nsp.to(roomId).emit('pkEnd', {
            userList: userList,
            roomType: "english",
            action: 'join',
            target: 'participator',
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
            let roomId = "1" + new Date().getTime();
            let englishRoom = new EnglishRoom(roomId);
            socket.join(roomId);
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
        const {roomId} = message;
        let roomInfo = ctx.service.socketService.socketioService.getRoomList(appName, roomId);
        let player=ctx.socketioService.socketioService.getUserList(appName,uid);
        if (!roomInfo) {
            return
        }
        socket.join(roomId);
        roomInfo.joinRoom(player)
    }

    startgame(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid, uid} = query;
        const message = ctx.args[0] || {};
        const {roomId} = message;

    }



    leaveroom(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid, uid} = query;
        const message = ctx.args[0] || {};
        const {roomId} = message;
        let player = ctx.service.socketService.socketioService.getUserList(appName, uid);
        let roomInfo = ctx.service.socketService.socketioService.getRoomList(appName,roomId);
        player.gameFinish();
        socket.leave(roomId);
        roomInfo.leaveRoom(uid);
        if(roomInfo.userList.size == 0 || player.isInitiator){
            ctx.service.socketService.socketioService.delRoom(appName,roomId);
        }

    }


}

module.exports = EnglishIOController;
