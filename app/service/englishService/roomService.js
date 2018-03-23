const Service = require('egg').Service;
const utils = require("../../utils/utils");
const englishConfigs = require("../../../sheets/english");
const constant = require("../../utils/constant");




class RoomService extends Service {
    async gameover(rid, uid, isFriend = 0, isLeave = false, leaveUid) {
        this.logger.info("gameover。。。。。。。。。。。。。。。。");
        let roomInfo = await this.app.redis.hgetall(rid);
        if(!roomInfo.rid){
            return
        }
        let owner = null;
        let challenger = null;
        let userList = JSON.parse(roomInfo.userList);
        for (let userId of userList) {
            if (userId == uid) {
                owner =await this.app.redis.hgetall(userId);
            } else {
                challenger =await this.app.redis.hgetall(userId);
            }
        }
        this.logger.info(challenger);
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

        let isJoin = false;
        let userList = JSON.parse(roomInfo.userList);
        let bystander = JSON.parse(roomInfo.bystander);
        let bSet = new Set(bystander);


        for (let userId of userList) {
            let play = await this.app.redis.hgetall(userId);
            if(userId !=ui.uid){
                isJoin = true
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
        if(isJoin){
            let p =  await this.app.redis.hgetall(ui.uid);
            p.rid = rid;
            if (userList.length > 2) {
                p.isBystander = 1;
                bSet.add(ui.uid);
                roomInfo.bystander = JSON.stringify(Array.from(bSet));

            } else {
                userList.push(ui.uid);
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
        let uSet = new Set(userList);

        player.rid = 0;
        if (Number(roomInfo.isFriend)) {
            //好友房
            //房间准备中
            if (roomInfo.roomStatus == constant.roomStatus.ready) {
                //是房主
                if (Number(player.isInitiator)) {
                    player.isInitiator=0;
                    //解散房间
                    for (let uid of userList) {
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
                    if (userList.includes(ui.uid)) {
                        uSet.delete(ui.uid);
                        if(bystanderList.length>0){
                            let userId = bystanderList.shift();
                            let bystand = await this.app.redis.hgetall(userId);
                            bystand.isBystander=0;
                            uSet.add(userId);
                            await this.app.redis.hmset(userId, bystand);
                        }
                        roomInfo.userList = JSON.stringify(Array.from(uSet));
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
                if(userList.includes(ui.uid)){
                //    this.ctx.service.englishService.englishService.pkEnd(rid,constant.AppName.ENGLISH,ui.uid);
                  //  for(let userId of userList){
                       // if(!Number(player.isInitiator)){
                        this.ctx.service.redisService.redisService.init(player,1);
                     //   }
                  //  }

                    //uSet.delete(ui.uid);
                 //   roomInfo.userList = JSON.stringify(Array.from(uSet));
                }else{
                    player.isBystander = 0;
                    bSet.delete(ui.uid);
                    roomInfo.bystander = JSON.stringify(Array.from(bSet));
                }
                await this.app.redis.hmset(rid, roomInfo);
                await this.app.redis.hmset(ui.uid, player);
            }

        }else{
            await this.app.redis.hmset(ui.uid, player);
        }

    }

}


module.exports = RoomService;