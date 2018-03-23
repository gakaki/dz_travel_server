const Service = require('egg').Service;
const utils = require("../../utils/utils");
const englishConfigs = require("../../../sheets/english");
const constant = require("../../utils/constant");

var tmp = -1;


class RoomService extends Service {
    async setFirstTimeOut(rid, settime) {
        let roomInfo = await this.app.redis.hgetall(rid);
        if(!roomInfo.rid){
            return
        }
        this.ctx.logger.info("开始第一次计时");
        roomInfo.roomStatus = constant.roomStatus.isGaming;
        roomInfo.isGameOver = 0;
        roomInfo.round = 1;
        await this.app.redis.hmset(rid, roomInfo);
        this.roundTO(rid, settime)
    }

    async roundTO(rid, t) {
        let roomInfo = await this.app.redis.hgetall(rid);
        if(!roomInfo.rid){
            return
        }
        this.ctx.logger.info("设置倒计时 " + roomInfo.round);
        let self = this;
        if (roomInfo.round == 6) {
            t = 2000
        }
        (function (j) {
            tmp = setTimeout(async function () {
                // 该轮结束了， 最多有一个人回答题目
                // 判断是否结束
                if (roomInfo.round == 6) {
                    // 去结算
                    self.gameEnd(rid);

                } else {
                    if (roomInfo.round == j) {
                        self.ctx.logger.info("玩家无响应，自动切题 " + j + "房间号 ：" + rid);

                        let wordList = JSON.parse(roomInfo.wordList);
                        self.ctx.logger.info(wordList[j]);

                        if (wordList[j] && wordList[j].type == 3) {
                            self.ctx.logger.info("题目类型为为3");
                            self.nextTurn(rid, 25000);
                        } else {
                            self.ctx.logger.info("题目类型为不为3");
                            self.nextTurn(rid ,17000);
                        }

                    }
                }

            }, t)


        })(Number(roomInfo.round));
    }


    async nextTurn(rid, clockTime = 15000) {
        let roomInfo = await this.app.redis.hgetall(rid);
        if(!roomInfo.rid){
            return
        }
     //   this.ctx.logger.info(roomInfo);
        if (Number(roomInfo.isGameOver)) {
            return;
        }
        // 切入下一题
        let round = Number(roomInfo.round);
        roomInfo.round = round + 1;


        this.ctx.logger.info("nextTurn");
        //  广播 切题
        this.ctx.service.englishService.englishService.roundEndNotice(rid, roomInfo.round);
        // 设置 下个 timeout
        this.ctx.logger.info("设置 下个 timeout" + clockTime);
        clearTimeout(tmp);
        //更新房间信息
       await this.app.redis.hmset(rid, roomInfo);
        this.roundTO(rid, clockTime);
    }

    async gameEnd(rid, leaveUid = null) {
        let roomInfo = await this.app.redis.hgetall(rid);
        if(!roomInfo.rid){
            return
        }
        this.ctx.logger.info("gameEnd"),roomInfo.isGameOver;

        if (Number(roomInfo.isGameOver)) {
            return;
        }

        roomInfo.isGameOver = 1;
        // 发 结果给 所有人
        this.ctx.logger.info(" 发 结果给 所有人");
        await this.ctx.service.englishService.englishService.pkEnd(rid, constant.AppName.ENGLISH, leaveUid);


        //设 游戏结束状态
        this.ctx.logger.info(" 设 游戏结束状态");
        let userList = JSON.parse(roomInfo.userList);
        if (Number(roomInfo.isFriend)) {
            roomInfo.roomStatus = constant.roomStatus.ready;
            for (let userId in userList) {
                this.ctx.logger.info(userList[userId].nickName + " 游戏结束 更改玩家状态。。。。");
                this.ctx.logger.info(userList[userId]);
                this.ctx.service.redisService.redisService.init(userList[userId],1);
            }
        }


        if (leaveUid != null) {
            delete userList(leaveUid)
        }
        roomInfo.userList = JSON.stringify((userList));
        await this.app.redis.hmset(rid, roomInfo);
    }

    async checkAnswer(rid, time) {
        let roomInfo = await this.app.redis.hgetall(rid);
        if(!roomInfo.rid){
            return
        }
        let isRoundEnd = true;


        this.ctx.logger.info("checkAnswer");
        this.ctx.logger.info(roomInfo);

        let userList = JSON.parse(roomInfo.userList);
        // 检查两方的答案， 判断是 游戏结束还是下一个回合，还是等待另外一方
        for (let userId in userList) {
            let player = userList[userId];
            let answers = JSON.parse(player.answers);
            this.ctx.logger.info(answers.length, Number(roomInfo.round));
            if (answers.length != Number(roomInfo.round)) {
                isRoundEnd = false;
            }
        }
        this.ctx.logger.info("下一题" + isRoundEnd);
        if (isRoundEnd) {
            this.nextTurn(rid, time)
        }
    }

    async gameover(rid, uid, isFriend = 0, isLeave = false, leaveUid) {
        this.logger.info("gameover。。。。。。。。。。。。。。。。");
        let roomInfo = await this.app.redis.hgetall(rid);
        if(!roomInfo.rid){
            return
        }
        let owner = null;
        let challenger = null;
        let userList = JSON.parse(roomInfo.userList);
        for (let userId in userList) {
            if (userId == uid) {
                owner = userList[userId];
            } else {
                challenger = userList[userId];
            }
        }
    //    this.logger.info(owner);
        let result = {
            exp: Number(englishConfigs.Constant.Get(englishConfigs.Constant.EXP).value),
            total: 0,
            star: 0,
            gold: 0,
            wins: 0,
            losses: 0,
            final: 0,
            challenger: challenger
        };
        if (!isFriend) {
            result.total = 1;
        }
        if (isLeave) {
            if (uid == leaveUid) {
                if (!isFriend) {
                    result.losses = 1;
                }
            } else {
                if (!isFriend) {
                    result.wins = 1;
                    result.star = 1;
                    result.gold = Number(englishConfigs.Stage.Get(owner.rankType).goldcoins2)
                }
                result.final = 2;
            }

        } else {
            if (owner.score > challenger.score) {
                if (!isFriend) {
                    result.wins = 1;
                    result.star = 1;
                    result.gold = Number(englishConfigs.Stage.Get(owner.rankType).goldcoins2)
                }
                result.final = 2;
            } else {
                if (owner.score == challenger.score) {
                    result.final = 1;
                }
                if (!isFriend) {
                    result.losses = 1;
                }


            }
        }


        return result;
    }


    async joinRoom(rid, ui) {
        let roomInfo = await this.app.redis.hgetall(rid);
        if(!roomInfo.rid){
            return
        }

        this.ctx.logger.info("不是房主，我要加入");

        let exchange = false;
        let userList = JSON.parse(roomInfo.userList);
        let bystander = JSON.parse(roomInfo.bystander);
        let bSet = new Set(bystander);

        for (let userId in userList) {
            let play = userList[userId];
            if(userId !=ui.uid){
                exchange = true
            }
            if (Number(play.isInitiator)) {
                let roomMaster = userId;
                if (ui.uid != roomMaster) {
                    await this.ctx.model.PublicModel.User.update({
                        uid: ui.uid,
                        appName: constant.AppName.ENGLISH
                    }, {$addToSet: {["character.friendsList"]: roomMaster}});
                    await this.ctx.model.PublicModel.User.update({
                        uid: roomMaster,
                        appName: constant.AppName.ENGLISH
                    }, {$addToSet: {["character.friendsList"]: ui.uid}});
                }
                break;
            }
        }
        if(exchange){
            let p =  await this.app.redis.hgetall(ui.uid);
            p.rid = rid;
            if (Object.keys(userList).length > 2) {
                p.isBystander = 1;
                bSet.add(ui.uid);
                roomInfo.bystander = JSON.stringify(Array.from(bSet));

            } else {
                userList[ui.uid] = p;
                roomInfo.userList = JSON.stringify(userList);
            }
            //更新玩家信息
            await this.app.redis.hmset(ui.uid, p);
            //更新房间信息
            await this.app.redis.hmset(rid, roomInfo);
        }




       this.ctx.service.englishService.englishService.notice(rid);

    }

    async leaveRoom(rid, ui) {
        let roomInfo = await this.app.redis.hgetall(rid);
        if(!roomInfo.rid){
            return
        }
        let player = await this.app.redis.hgetall(ui.uid);

        if (!player) {
            player = await this.ctx.service.redisService.redisService.init(ui)
        }
      //  let nsp = this.app.io.of("/english");
        let userList = JSON.parse(roomInfo.userList);
        let bystanderList = JSON.parse(roomInfo.bystander);
        let bSet = new Set(bystanderList);
        //好友房
        if (Number(roomInfo.isFriend)) {
            player.rid = 0;
            //房间准备中
            if (roomInfo.roomStatus == constant.roomStatus.ready) {
                //是房主
                if (Number(player.isInitiator)) {
                    player.isInitiator=0;
                    //解散房间
                    for (let uid in userList) {
                        let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, uid);
                        if (socket) {
                            this.logger.info("兄弟们该撤了");
                            socket.emit("dissolve", {
                                code: constant.Code.OK,
                            });
                            socket.leave(rid);
                        }
                    }

                    for (let buid of bystanderList) {
                        let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, buid);
                        if (socket) {
                            this.logger.info("兄弟们该撤了");
                            socket.emit("dissolve", {
                                code: constant.Code.OK,
                            });
                            socket.leave(rid);
                        }
                    }
                    await this.app.redis.hmset(ui.uid, player);
                    await this.app.redis.del(rid);
                } else {
                    //玩家
                    if (userList[ui.uid]) {
                        delete userList[ui.uid];
                        if(bystanderList.length>0){
                            let userId = bystanderList.shift();
                            let bystand = await this.app.redis.hgetall(userId);
                            bystand.isBystander=0;
                            userList[userId] = bystand;
                            await this.app.redis.hmset(userId, bystand);
                        }
                        roomInfo.userList = JSON.stringify(userList);
                        roomInfo.bystander = JSON.stringify(bystanderList);
                    } else {
                        //旁观者
                        player.isBystander = 0;
                        bSet.delete(ui.uid);
                        roomInfo.bystander = JSON.stringify(Array.from(bSet));
                    }

                    await this.app.redis.hmset(rid, roomInfo);
                    await this.app.redis.hmset(ui.uid, player);
                    this.ctx.service.englishService.englishService.notice(rid);
                }

            }else{
                //开始游戏了
                if(userList[ui.uid]){
                    this.ctx.service.englishService.englishService.pkEnd(rid,constant.AppName.ENGLISH,ui.uid);
                    if(!Number(player.isInitiator)){
                        for(let userId in userList){
                            if(userId == ui.uid){
                                this.ctx.service.redisService.redisService.init(userList[userId],1);
                            }
                        }

                        roomInfo.roomStatus = constant.roomStatus.ready;
                        delete userList[ui.uid];
                    }
                }else{
                    player.isBystander = 0;
                    bSet.delete(ui.uid);
                    roomInfo.bystander = JSON.stringify(Array.from(bSet));
                }
                await this.app.redis.hmset(rid, roomInfo);
                await this.app.redis.hmset(ui.uid, player);
            }

        }else{
            this.ctx.service.englishService.englishService.pkEnd(rid,constant.AppName.ENGLISH,ui.uid);
        }

    }

}


module.exports = RoomService;