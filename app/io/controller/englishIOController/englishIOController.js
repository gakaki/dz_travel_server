const Controller = require('egg').Controller;
const EnglishRoom = require('../../room/englishRoom/englishRoom');
const constant = require("../../../utils/constant");
const utils = require("../../../utils/utils");
const englishConfigs = require("../../../../sheets/english");

class EnglishIOController extends Controller {

    async ranking() {
        const {ctx, app} = this;
        const nsp = app.io.of('/english');
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] ||{};
        const {rankType} = message;
        ctx.logger.info("排位赛");
        ctx.logger.info("选择的段位 ：" +rankType);
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
        let roomList = this.app.roomList.has(appName)?this.app.roomList.get(appName):new Map();
        for(let room of roomList.values()){
            for(let uid of room.userList.keys()){
                if(uid == ui.uid && room.isFriend){
                    socket.emit("inRoom",{
                        code:constant.Code.OK,
                    });
                   return;
                }
            }
        }

        app.messenger.sendToApp('refresh',{appName:constant.AppName.ENGLISH,uid:ui.uid,ranking:true,round:false,rankType:rankType,status:constant.playerStatus.ready,user:ui});


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
        if(roomInfo.isGameOver || roomInfo.roomStatus.ready == constant.roomStatus.ready){
            return;
        }
        if(!wid){
            ctx.logger.info("没有拿到单词");
            return
        }



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

        let libArr =player.user.character.wordList[dateStr] || [];
        let lib = new Set(libArr);

        if(!lib.has(wid)){
            ctx.logger.info("更新单词 ："+wid);
            await ctx.model.PublicModel.User.update({uid:ui.uid,appName:appName},{$push:{["character.wordList."+dateStr]:wid}});
            ui=await ctx.model.PublicModel.User.findOne({uid:ui.uid,appName:appName});
        }

        ctx.app.messenger.sendToApp('refresh',
            {appName:constant.AppName.ENGLISH,uid:ui.uid,round:true,clockTime:clockTime,score:totalScore,isRight:isRight,answer:answer,user:ui,time:round,rid:rid});

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
        ctx.logger.info("入参 ："+rid);
        ctx.logger.info(ui.nickName+ "加入房间");
        let player = app.userList.has(appName)?app.userList.get(appName).get(ui.uid):null;
        if(!player){
            return;
        }
        ctx.logger.info(ui.nickName+ "当前状态 "+ player.status);
        ctx.logger.info(ui.nickName+ "当前房主状态 "+ player.isInitiator);
        //没有传rid，判断在不在房间内
        let isCreate = false;
        let isExist =true;
        let roomInfo =app.roomList.has(appName)?app.roomList.get(appName).get(rid):null;
        if(rid){
            if(!roomInfo){
                ctx.logger.info("房间不存在");
                isExist =false;
            }else{
                if(!roomInfo.isFriend){
                    isExist =false;
                }
            }

        }

        let roomList = this.app.roomList.has(appName)?this.app.roomList.get(appName):new Map();
        let roomId = null;
        for(let room of roomList.values()){
            if(room.isFriend){
                for(let uid of room.userList.keys()){
                    if(uid == ui.uid){
                        //在房间内
                        if(rid && rid != room.rid) {
                            ctx.logger.info("离开了？？" + room.rid,rid);
                            roomId =rid;
                            app.messenger.sendToApp('leaveRoom', {appName: constant.AppName.ENGLISH, uid: ui.uid});
                        }else if(rid && room.rid ==rid){
                            roomId =room.rid;
                        }else if(!rid && room.rid){
                            roomId= room.rid
                        }
                        break;
                    }
                }
            }
        }
        if(rid && isExist){
            roomId =rid;
        }

        let room =app.roomList.has(appName)?app.roomList.get(appName).get(roomId):null;
        if(!room){
            isExist = false;
            roomId = null;
        }
        ctx.logger.info("当前房间号 ："+ roomId);
        ctx.logger.info("房间存不存在 ："+ isExist);
        if(isExist && roomId !=null){
            ctx.logger.info("不是房主，我要加入");
            socket.join(roomId);
            for(let play of room.userList.values()){
                if(play.isInitiator){
                    let roomMaster = play.user.uid;
                    if(ui.uid != roomMaster){
                        await ctx.model.PublicModel.User.update({uid:ui.uid,appName:appName},{$addToSet:{["character.friendsList"]:roomMaster}});
                        await ctx.model.PublicModel.User.update({uid:roomMaster,appName:appName},{$addToSet:{["character.friendsList"]:ui.uid}});
                    }

                    break;
                }
            }

            app.messenger.sendToApp('joinRoom',{appName:constant.AppName.ENGLISH,uid:ui.uid,rid:roomId});

        }else{
            ctx.logger.info("创建房间 :"+roomId);
            isCreate = true;
            roomId = "11" + new Date().getTime();
            player.setInitiator();
            let season =ctx.service.englishService.englishService.getSeason();
            let difficulty = englishConfigs.Stage.Get(player.user.character.season[season].rank).difficulty;
            let index = utils.Rangei(0,difficulty.length);
            let wordList=ctx.service.englishService.englishService.setQuestions(player.user.character.season[season].rank);
            socket.join(roomId);
            app.messenger.sendToApp('createRoom',{appName:constant.AppName.ENGLISH,rid:roomId,difficulty:difficulty[index],wordList:wordList,uid:ui.uid});
            ctx.logger.info("创建房间发送信息 :"+roomId,isCreate);

        }
        socket.emit("joinSuccess",{
            code:constant.Code.OK,
            data:{
                rid:roomId,
                isCreate:isCreate
            }
        });

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
            ctx.logger.info("用户不存在");
            return;
        }
        let player = app.userList.has(appName)?app.userList.get(appName).get(ui.uid):null;
        if(!player){
            ctx.logger.info("玩家不存在");
            return;
        }


        let roomInfo =app.roomList.has(appName)?app.roomList.get(appName).get(rid):null;
        if(!roomInfo){
            ctx.logger.info("房间不存在");
            socket.emit("roomExpired",{
                code:constant.Code.ROOM_EXPIRED
            });
            return;
        }

        if(!roomInfo.isFriend){
            ctx.logger.info("不是好友房");
            return
        }

        if(!player.isInitiator){
            ctx.logger.info("不是房主");
            return
        }

        if(roomInfo.userList.size < 2){
            ctx.logger.info("房间人数不足");
            socket.emit("needUpdate",{
                code:constant.Code.ROOM_NEED_UPDATE,
                rid:rid
            });
            return
        }
        for(let play of roomInfo.userList.values()){
            if(play.status != constant.playerStatus.online){
                ctx.logger.info("状态不正确。。。");
                return
            }
        }
        let season =ctx.service.englishService.englishService.getSeason();

        let wordList=ctx.service.englishService.englishService.setQuestions(player.user.character.season[season].rank);

        app.messenger.sendToApp('setRoom',{appName:constant.AppName.ENGLISH,rid:rid,wordList:wordList});


        let userList=[];
        for(let player of roomInfo.userList.values()){
            let user={
                info: player.user,
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
        const {rid,a} = message;
        ctx.logger.info(rid);
        ctx.logger.info(a);
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
            ctx.logger.info("房间不存在 ：" + rid);
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
            socket.emit('roomIsNotExist',{
                code:constant.Code.OK
            });
            return;
        }
        if(!roomInfo.isFriend){
            return
        }
        let userList = [];
        for(let player of roomInfo.userList.values()){
            this.logger.info("getRoomInfo  ：" ,JSON.stringify(player.user));
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

        this.logger.info("我拿到的房间信息 ： ",rinfo);


        this.logger.info("我拿到的玩家信息 ：" +userList);

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

    async roomisexist(){
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
        let roomInfo= this.app.roomList.has(appName) ? this.app.roomList.get(appName).get(rid) : null;
        let isExist = false;
        if(roomInfo){
            isExist =true;
        }

        socket.emit("roomExist",{
            code:constant.Code.OK,
            data:{
                isExist:isExist
            }
        })
    }

}

module.exports = EnglishIOController;
