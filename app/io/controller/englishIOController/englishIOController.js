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
        ctx.logger.info("排位赛");
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
            return;
        }

        player.setStatus(constant.playerStatus.ready);
        player.setRankType(rankType);
        player.setUser(ui);

        app.messenger.sendToApp('refresh',{appName:constant.AppName.ENGLISH,uid:ui.uid,ranking:true,round:false,rankType:rankType,status:constant.playerStatus.ready,user:ui});


      //  setTimeout(function () {
        app.messenger.sendToApp('readyMatch',{appName:appName,player:ui.uid});
     //   },2000)

    }

    async cancelmatch(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        ctx.logger.info("取消排位");
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

    }

    async roundend(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {answer,type,score,totalScore,isRight,rid,wid,round,clockTime} = message;
        const nsp=app.io.of("/english");
        ctx.logger.info("一轮结束");

        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            return;
        }
        ctx.logger.info("我拿到的数据 "+ui.nickName ,message);
        let player = app.userList.has(appName)?app.userList.get(appName).get(ui.uid):null;
        if(!player){
            ctx.logger.info("没有拿到玩家信息");
            return;
        }
        let roomInfo =app.roomList.has(appName)?app.roomList.get(appName).get(rid):null;
        if(!roomInfo){
            ctx.logger.info("没有拿到房间信息");
            return;
        }
        if(!wid){
            ctx.logger.info("没有拿到单词");
            return
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
            wid:wid,//单词id
            date:new Date().toLocaleDateString(),
            time:new Date().toLocaleTimeString()

        };
        ctx.model.EnglishModel.EnglishAnswerRecord.create(englishAnswerRecord);

        let dateStr = new Date().toLocaleDateString();
     //   player.user.character.wordList?player.user.character.wordList:{};
        let libArr =player.user.character.wordList[dateStr] || [];
        let lib = new Set(libArr);

        if(!lib.has(wid)){
            ctx.logger.info("更新单词 ："+wid);
            await ctx.model.PublicModel.User.update({uid:ui.uid,appName:appName},{$push:{["character.wordList."+dateStr]:wid}});
            ui=await ctx.model.PublicModel.User.findOne({uid:ui.uid,appName:appName});
            player.setUser(ui);
        }

        ctx.app.messenger.sendToApp('refresh',
            {appName:constant.AppName.ENGLISH,uid:ui.uid,round:true,clockTime:clockTime,score:totalScore,isRight:isRight,answer:answer,user:ui,time:round,rid:rid});

    }



/*    async createroom(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        ctx.logger.info("创建房间");
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if(ui==null){
            return;
        }
        let player = app.userList.has(appName)?app.userList.get(appName).get(ui.uid):null;
        if(!player){
            return;
        }

        socket.emit("createSuccess",{
            code:constant.Code.OK,
            data:{
                rid:rid
            }
        });
    }*/

    async joinroom() {
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
        ctx.logger.info(ui.nickName+ "加入房间");
        let player = app.userList.has(appName)?app.userList.get(appName).get(ui.uid):null;
        if(!player){
            return;
        }

        let roomList = this.app.roomList.has(appName)?this.app.roomList.get(appName):new Map();
        let roomId = null;
        for(let room of roomList.values()){
            for(let uid of room.userList.keys()){
                if(uid == ui.uid){
                    roomId = room.rid;
                    console.log("存在房间 :"+roomId);
                    socket.emit("joinSuccess",{
                        code:constant.Code.OK,
                        data:{
                            rid:roomId
                        }
                    });
                    return
                }
            }
        }

        if(rid){
            let roomInfo =app.roomList.has(appName)?app.roomList.get(appName).get(rid):null;
            if(!roomInfo){
                ctx.logger.info("房间不存在");
                return;
            }

            if(!roomInfo.isFriend){
                return
            }

            socket.join(rid);

            for(let player of roomInfo.userList.values()){
                if(player.isInitiator){
                    let roomMaster = player.user.uid;
                    await ctx.model.PublicModel.User.update({uid:ui.uid,appName:appName},{$addToSet:{["character.friendsList"]:roomMaster}});
                    await ctx.model.PublicModel.User.update({uid:roomMaster,appName:appName},{$addToSet:{["character.friendsList"]:ui.uid}});
                    break;
                }
            }

            app.messenger.sendToApp('joinRoom',{appName:constant.AppName.ENGLISH,uid:ui.uid,rid:rid,isJoin:true});
        }else {
            if(roomId == null){
                roomId = "11" + new Date().getTime();
                player.setInitiator();
                let season =ctx.service.englishService.englishService.getSeason();
                let difficulty = englishConfigs.Stage.Get(player.user.character.season[season].rank).difficulty;
                let index = utils.Rangei(0,difficulty.length);
                let wordList=ctx.service.englishService.englishService.setQuestions(player.user.character.season[season].rank);
                socket.join(roomId);
                app.messenger.sendToApp('createRoom',{appName:constant.AppName.ENGLISH,rid:roomId,difficulty:difficulty[index],wordList:wordList,uid:ui.uid});
            }
            socket.emit("joinSuccess",{
                code:constant.Code.OK,
                data:{
                    rid:roomId
                }
            });
        }




    }

    async startgame(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const nsp = app.io.of('/english');
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {rid} = message;
        ctx.logger.info("开始游戏");
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

        if(!player.isInitiator){
            return
        }

        if(roomInfo.userList.size !=2){
            return
        }
        for(let play of roomInfo.userList.values()){
            if(play.status != constant.playerStatus.online){
                return
            }
        }




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
                rid:rid
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
        ctx.logger.info(ui.nickName+" 离开房间");
        let player = app.userList.has(appName)?app.userList.get(appName).get(ui.uid):null;

        if(!player){
            return;
        }
        let roomInfo =app.roomList.has(appName)?app.roomList.get(appName).get(rid):null;
        if(!roomInfo){
            return;
        }
        socket.leave(rid);

        app.messenger.sendToApp('leaveRoom',{appName:appName,uid:ui.uid});


    }

    async getroominfo() {
        const {ctx, app} = this;
        const socket = ctx.socket;
        const nsp = app.io.of('/english');
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {rid} = message;
        ctx.logger.info("roomInfo房间号 ：" + rid);
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            return;
        }
        let player = app.userList.get(appName).get(ui.uid);

        if (!player) {
            return;
        }
        let roomInfo = app.roomList.get(appName).get(rid);
        if (!roomInfo) {
            ctx.logger.info("没拿到房间信息");
            return;
        }
        if(!roomInfo.isFriend){
            return
        }
        let userList = [];
        for(let player of roomInfo.userList.values()){
            let user={
                info :player.user,
                isInitiator:player.isInitiator,
            };
            userList.push(user);
        }

        let rinfo = {
            userList: userList,
            bystanderCount: roomInfo.bystander.size,
            rid: rid,
            isFriend: true,
            roomStatus: roomInfo.roomStatus
        };

        nsp.to(rid).emit('roomInfo', {
            code: constant.Code.OK,
            data: {
                userList: userList,
                roomInfo: rinfo
            }
        });

    }



    async getmatchinfo(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const nsp = app.io.of('/english');
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {rid} = message;
        ctx.logger.info("matchInfo房间号 ："+rid);
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
                isInitiator:player.isInitiator,
            };
            userList.push(user);
        }

        socket.emit('matchInfo', {
            code:constant.Code.OK,
            data:{
                userList:userList,
                rid:rid
            }
        });


    }


    async getpkinfo(){
        const {ctx, app} = this;
        const socket = ctx.socket;
        const nsp = app.io.of('/english');
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {rid} = message;
        ctx.logger.info("pkinfo房间号 ："+rid);
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
                isInitiator:player.isInitiator,
                score:player.score,
                continuousRight:player.continuousRight,
                playerAnswer:player.answer
            };
            userList.push(user);
        }
        socket.emit('pkInfo', {
            code:constant.Code.OK,
            data:{
                userList:userList,
                roomInfo:roomInfo
            }
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
        let player = app.userList.get(appName).get(ui.uid);

        if(!player){
            return;
        }
      /*  let roomInfo = app.roomList.get(appName).get(rid);
        if(!roomInfo){
            return;
        }*/

        app.messenger.sendToApp('test',{appName:appName,uid:ui.uid});
    }


}

module.exports = EnglishIOController;
