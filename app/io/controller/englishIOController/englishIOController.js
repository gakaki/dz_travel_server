const Controller = require('egg').Controller;
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
        const message = ctx.args[0] || {};
        const {rankType} = message;
        ctx.logger.info("排位赛");
        ctx.logger.info("选择的段位 ：" + rankType);
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            return;
        }

        let cost = englishConfigs.Stage.Get(rankType).goldcoins1;
        if (ui.items[englishConfigs.Item.GOLD] < cost) {
            socket.emit("needGold", {
                code: constant.Code.NEED_ITEMS
            });
            return;
        }

          let  player = await  this.ctx.service.redisService.redisService.init(ui);

        let roomId = Number(player.rid);
        if (roomId) {
            let roomInfo = await this.app.redis.hgetall(roomId);
            if (roomInfo && Number(roomInfo.isFriend)) {
                socket.emit("inRoom", {
                    code: constant.Code.OK,
                });
                return;
            } else {
                roomId = 0
            }
        }

        //更新用户信息
        await app.redis.hmset(ui.uid, {rankType: rankType, startTime: new Date().getTime(), rid: roomId});
        //添加到匹配池
        await app.redis.sadd("matchpool", ui.uid);


    }

    async cancelmatch() {
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        ctx.logger.info("取消排位");
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            return;
        }
        let player = await app.redis.hgetall(ui.uid);

        if (!player) {
            player = await this.ctx.service.redisService.redisService.init(ui);
        }

        //查看在不在匹配池
        let isExist = await app.redis.sismember("matchpool", ui.uid);
        ctx.logger.info("查看在不在匹配池"+isExist );
        let isGiveUp = false;
        if (isExist) {
            //在匹配池 ，离开匹配池
            await app.redis.srem("matchpool", ui.uid)
        } else {
            //不在匹配池，说明已经匹配到
            isGiveUp = true;

        //    await ctx.service.englishService.englishService.pkEnd(player.rid, constant.AppName.ENGLISH, player.uid);
        }
        //更新用户信息
        await this.ctx.service.redisService.redisService.init(ui);
        ctx.service.englishService.englishService.matchFailed(player.uid, true, isGiveUp);

    }

    async roundend() {
        const {ctx, app} = this;
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {answer, type, score, totalScore, isRight, rid, wid, round, clockTime} = message;
        const nsp = app.io.of("/english");
        ctx.logger.info("一轮结束");

        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            return;
        }
        ctx.logger.info("我拿到的数据 " + ui.nickName, message);

        let roomInfo = await this.app.redis.hgetall(rid);

        if(!roomInfo.rid){
            socket.emit('roundEndSettlement', {
                code: constant.Code.ROOM_EXPIRED,
            });
            ctx.logger.info("没有拿到房间信息");
            return;
        }
        if (Number(roomInfo.isGameOver) || roomInfo.roomStatus.ready == constant.roomStatus.ready) {
            ctx.logger.info("房间状态异常");
            socket.emit('roundEndSettlement', {
                code: constant.Code.REQUIRED_LOST,
            });
            return;
        }
        if (!wid) {
            ctx.logger.info("没有拿到单词");
            socket.emit('roundEndSettlement', {
                code: constant.Code.REQUIRED_LOST,
            });
            return
        }
        let player = await app.redis.hgetall(ui.uid);

        if (!player) {
            player = await this.ctx.service.redisService.redisService.init(ui);
        }

        let englishAnswerRecord = {
            uid: ui.uid,
            rid: rid,
            type: type, //题目类型
            answer: answer,
            score: score,
            isRight: isRight,
            wid: wid,//单词id
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()

        };
        ctx.model.EnglishModel.EnglishAnswerRecord.create(englishAnswerRecord);

        let dateStr = new Date().toLocaleDateString();

        let libArr = ui.character.wordList[dateStr] || [];
        let lib = new Set(libArr);

        if (!lib.has(wid)) {
            ctx.logger.info("更新单词 ：" + wid);
            await ctx.model.PublicModel.User.update({
                uid: ui.uid,
                appName: appName
            }, {$push: {["character.wordList." + dateStr]: wid}});
            ui = await ctx.model.PublicModel.User.findOne({uid: ui.uid, appName: appName});
        }

        let uList = JSON.parse(roomInfo.userList);
        let answers = JSON.parse(player.answers);

        answers.push(answer);
        player.answer = answer;
        player.score = totalScore;
        player.answers = JSON.stringify(answers);
        let right = Number(player.right);
        let continuousRight = Number(player.continuousRight);
        let mistake = Number(player.mistake);
        if (isRight) {
            player.right = right + 1;
            player.continuousRight = continuousRight + 1;
        } else {
            player.mistake = mistake + 1;
            player.continuousRight = 0;
        }
        //更新房间信息
      //  uList[ui.uid] = player;
    //    this.logger.info(player);
      //  roomInfo.userList = JSON.stringify(uList);
      //  this.logger.info(ui.nickName);
     //   this.logger.info(uList);
       // await app.redis.hmset(rid, roomInfo);

        //更新用户信息
        await this.app.redis.hmset(ui.uid, player);



        // let word = roomInfo.wordList[round];
        // let settime = 17000;
        // if (word && word.type == 3) {
        //     settime = 25000
        // }
        // await ctx.service.englishService.roomService.checkAnswer(rid, settime);


        app.logger.info("给客户端广播发送答案了。。");
        let us = [];
        for (let uid of uList) {
            let p = await this.app.redis.hgetall(uid);
            let player = {
                uid: uid,
                score: Number(p.score),
                answer: p.answer,
            };
            us.push(player);
        }

        nsp.to(rid).emit('roundEndSettlement', {
            code: constant.Code.OK,
            data: {
                round: round,
                userList: us,
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
        if (ui == null) {
            return;
        }
        ctx.logger.info("入参 ：" + rid);
        ctx.logger.info(ui.nickName + "加入房间");

        let player = await app.redis.hgetall(ui.uid);
        ctx.logger.info(player);

        if (!player) {
            ctx.logger.info("需要初始化？？？");
            player = await this.ctx.service.redisService.redisService.init(ui,1);
        }
        let isCreate = false;
        let isExist = true;
        let roomId = null;
        //有想加入的房间
        if (rid) {
            let roomInfo = await this.app.redis.hgetall(rid);
            //房间不存在
            if(!roomInfo.rid){
                ctx.logger.info("房间不存在");
                isExist = false;
            } else {
                //不是好友房
                if (!Number(roomInfo.isFriend)) {
                    isExist = false;
                }
            }

            //要加入的房间存在
            if (isExist) {
                roomId = rid;
            }
            let userList = JSON.parse(roomInfo.userList);
            if(userList.length > 2){
                for(let id of userList){
                    if(id != ui.uid){
                        return
                    }
                }
            }

        }

        //没有传rid，判断在不在房间内,用户存在rid

        if (Number(player.rid)) {
            //要加入的房间与用户所在房间不符，
            if (roomId && roomId != player.rid) {
                ctx.logger.info("离开了？？" + player.rid, roomId);
                await ctx.service.englishService.roomService.leaveRoom(player.rid,ui);
               //  player = await app.redis.hgetall(ui.uid);
            }else{
                roomId = player.rid;
            }
        }

        let roomInfo = await this.app.redis.hgetall(roomId);

        if(!roomInfo.rid){
            isExist = false;
        }

        ctx.logger.info("玩家所在房间 ："+player.rid);
        ctx.logger.info("当前房间号 ：" + roomId);
        ctx.logger.info("房间存不存在 ：" + isExist);
        if (isExist && roomId != null) {
            socket.join(rid);
            this.ctx.service.englishService.englishService.notice(roomId);
         //  let isJoin =  await ctx.service.englishService.roomService.joinRoom(roomId, ui,socket);
           // if(!isJoin){
           //     ctx.logger.info("创建房间 :" + roomId);
           //     isCreate = true;
           //     roomId = "11" + new Date().getTime();
           //     socket.join(roomId);
           //     let matchPoolPlayer = new Set();
           //     matchPoolPlayer.add(player);
           //     await this.ctx.service.redisService.redisService.initRoom(matchPoolPlayer, roomId, 1);
           //
           //     //app.messenger.sendToApp('createRoom',{appName:constant.AppName.ENGLISH,rid:roomId,difficulty:difficulty[index],wordList:wordList,uid:ui.uid,user:ui});
           //     ctx.logger.info("创建房间发送信息 :" + roomId, isCreate);
           //     this.ctx.service.englishService.englishService.notice(roomId);
           // }
            //    app.messenger.sendToApp('joinRoom',{appName:constant.AppName.ENGLISH,uid:ui.uid,rid:roomId,user:ui});

        } else {
            ctx.logger.info("创建房间 :" + roomId);
            isCreate = true;
            roomId = "11" + new Date().getTime();
            socket.join(roomId);
            let matchPoolPlayer = new Set();
            matchPoolPlayer.add(player);
            await this.ctx.service.redisService.redisService.initRoom(matchPoolPlayer, roomId, 1);

            //app.messenger.sendToApp('createRoom',{appName:constant.AppName.ENGLISH,rid:roomId,difficulty:difficulty[index],wordList:wordList,uid:ui.uid,user:ui});
            ctx.logger.info("创建房间发送信息 :" + roomId, isCreate);
            this.ctx.service.englishService.englishService.notice(roomId);

        }
        socket.emit("joinSuccess", {
            code: constant.Code.OK,
            data: {
                rid: roomId,
                isCreate: isCreate
            }
        });

    }

    async startgame() {
        const {ctx, app} = this;
        const socket = ctx.socket;
        const nsp = app.io.of('/english');
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {rid} = message;
        ctx.logger.info("开始游戏");
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            ctx.logger.info("用户不存在");
            return;
        }

        let player = await app.redis.hgetall(ui.uid);


        let roomInfo = await app.redis.hgetall(rid);
        ctx.logger.info("準備開始游戲");
        ctx.logger.info(roomInfo);
        if(!roomInfo.rid){
            ctx.logger.info("房间不存在");
            socket.emit("roomExpired", {
                code: constant.Code.ROOM_EXPIRED
            });
            return;
        }

        if (!Number(roomInfo.isFriend)) {
            ctx.logger.info("不是好友房");
            return
        }

        if (!Number(player.isInitiator)) {
            ctx.logger.info("不是房主");
            return
        }

        let userList = JSON.parse(roomInfo.userList);
        if (userList.length < 2) {
            ctx.logger.info("房间人数不足");
            socket.emit("needUpdate", {
                code: constant.Code.ROOM_NEED_UPDATE,
                rid: rid
            });
            return
        }

        let season = this.ctx.service.englishService.englishService.getSeason();
        let pk = ui.character.season[season].rank;
        let difficulty = englishConfigs.Stage.Get(pk).difficulty;
        let index = utils.Rangei(0, difficulty.length);
        let wordList = this.ctx.service.englishService.englishService.setQuestions(difficulty[index]);
        roomInfo.wordList = JSON.stringify(wordList);
        roomInfo.difficulty = difficulty;
        roomInfo.roomStatus=constant.roomStatus.isGaming;
        roomInfo.isGameOver = 0;
        roomInfo.round = 1;
        await this.app.redis.hmset(rid, roomInfo);
        nsp.to(rid).emit('matchSuccess', {
            code: constant.Code.OK,
            data: {
                rid: rid
            }
        });

        // this.logger.info("开启定时器");
        // //设置第一次定时器
        // let firstWord = JSON.parse(roomInfo.wordList)[0];
        // let settime = 27000;
        // if (firstWord && firstWord.type == 3) {
        //     settime = 30000;
        // }

       await app.redis.sadd("roomPool",rid);
      //  ctx.service.englishService.roomService.setFirstTimeOut(rid, settime);

    }


    async leaveroom() {
        const {ctx, app} = this;
        const socket = ctx.socket;
        const nsp = app.io.of('/english');
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {rid, a} = message;
        ctx.logger.info(rid);
        ctx.logger.info(a);
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            return;
        }
        let player = await app.redis.hgetall(ui.uid);

        if (!player) {
            await this.ctx.service.redisService.redisService.init(ui);
        }

        ctx.logger.info(ui.nickName + " 离开房间");
        let roomId =rid;
        if(!roomId){
            roomId = player.rid
        }
        let roomInfo = await this.app.redis.hgetall(roomId);
        if(!roomInfo.rid){
            ctx.logger.info("房间不存在");
            socket.emit("roomExpired", {
                code: constant.Code.ROOM_EXPIRED
            });
            return;
        }

        await ctx.service.englishService.roomService.leaveRoom(rid,ui);

       // socket.leave(rid);

       // app.messenger.sendToApp('leaveRoom', {appName: appName, uid: ui.uid});


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
        let roomInfo = await this.app.redis.hgetall(rid);

        if(!roomInfo.rid){
            ctx.logger.info("没拿到房间信息");
            socket.emit('room', {
                code: constant.Code.ROOM_EXPIRED
            });
            return;
        }

        if (!Number(roomInfo.isFriend)) {
            ctx.logger.info("不是好友房");
            socket.emit('room', {
                code: constant.Code.REQUIRED_LOST
            });
            return
        }
         let season =ctx.service.englishService.englishService.getSeason();
        let lastRank = 0;
        let userList = JSON.parse(roomInfo.userList);
        let bystander = JSON.parse(roomInfo.bystander);
        let bSet = new Set(bystander);
        let uList = [];

        for (let uid in userList) {
            let player =await this.app.redis.hgetall(uid);
            let ui = await this.ctx.model.PublicModel.User.findOne({uid: uid, appName: constant.AppName.ENGLISH});
            let lastSeason = ui.character.season[season - 1];
            if (lastSeason) {
                lastRank = lastSeason.rank;
            }
            let user = {
                uid: player.uid,
                nickName: player.nickName,
                avatarUrl: player.avatarUrl,
                isInitiator: Number(player.isInitiator),
                lastRank: lastRank
            };
            uList.push(user);
        }

        let rInfo = {
            bystanderCount: bSet.size,
            rid: rid,
            isFriend: Number(roomInfo.isFriend),
            roomStatus: roomInfo.roomStatus
        };

        nsp.to(rid).emit('room', {
            code: constant.Code.OK,
            data: {
                userList: uList,
                roomInfo: rInfo
            }
        });
    }


    async getmatchinfo() {
        const {ctx, app} = this;
        const socket = ctx.socket;
        const nsp = app.io.of('/english');
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {rid} = message;
        ctx.logger.info("matchInfo房间号 ：" + rid);
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            return;
        }

        let roomInfo = await this.app.redis.hgetall(rid);
        if(!roomInfo.rid){
            ctx.logger.info("没有拿到房间信息");
            socket.emit('matchInfo', {
                code: constant.Code.ROOM_EXPIRED,
            });
            return;
        }
        let season =ctx.service.englishService.englishService.getSeason();
        let userList = JSON.parse(roomInfo.userList);
        let uList = [];
        let lastRank = 0;
        for (let uid of userList) {
            let player =await this.app.redis.hgetall(uid);
            let ui = await this.ctx.model.PublicModel.User.findOne({uid: uid, appName: constant.AppName.ENGLISH});
            let winningStreak = ui.character.winningStreak;
            let lastSeason = ui.character.season[season - 1];
            if (lastSeason) {
                lastRank = lastSeason.rank;
            }

            let city = ui.city;
            let user = {
                uid: player.uid,
                level: ui.character.level,
                nickName: player.nickName,
                avatarUrl: player.avatarUrl,
                winningStreak: winningStreak,
                city: city,
                lastRank: lastRank
            };

            uList.push(user)
        }

        socket.emit('matchInfo', {
            code: constant.Code.OK,
            data: {
                userList: uList,
                rid: rid
            }
        });


    }


    async getpkinfo() {
        const {ctx, app} = this;
        const socket = ctx.socket;
        const nsp = app.io.of('/english');
        const query = socket.handshake.query;
        const {appName, _sid} = query;
        const message = ctx.args[0] || {};
        const {rid} = message;
        ctx.logger.info("pkinfo房间号 ：" + rid);
        let ui = await ctx.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            return;
        }

        let roomInfo = await this.app.redis.hgetall(rid);
        ctx.logger.info(roomInfo);
        if(!roomInfo.rid){
            socket.emit('pkInfo', {
                code: constant.Code.ROOM_EXPIRED,
            });
            ctx.logger.info("没有拿到房间信息");
            return;
        }
        let season =ctx.service.englishService.englishService.getSeason();

        let userList = JSON.parse(roomInfo.userList);
        let uList = [];
        let lastRank = 0;
        for (let uid of userList) {
            let player =await this.app.redis.hgetall(uid);
            let ui = await this.ctx.model.PublicModel.User.findOne({uid: uid, appName: constant.AppName.ENGLISH});
            let lastSeason = ui.character.season[season - 1];
            if (lastSeason) {
                lastRank = lastSeason.rank;
            }
            let user = {
                uid: player.uid,
                nickName: player.nickName,
                avatarUrl: player.avatarUrl,
                lastRank: lastRank,
                developSystem: ui.character.developSystem
            };

            uList.push(user)
        }

        socket.emit('pkInfo', {
            code: constant.Code.OK,
            data: {
                userList: uList,
                roomInfo: {
                    rid: roomInfo.rid,
                    wordList: JSON.parse(roomInfo.wordList)
                }
            }
        });

    }


}

module.exports = EnglishIOController;
