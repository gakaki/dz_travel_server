const constant = require("./app/utils/constant");
const EnglishPlayer = require("./app/io/player/englishPlayer/englishPlayer");
const EnglishRoom = require("./app/io/room/englishRoom/englishRoom");

module.exports = app => {
    app.beforeStart(async () => {
        // 应用会等待这个函数执行完成才启动
        app.userList = new Map();
        app.matchPool = new Map();
        app.roomList = new Map();
        app.redis.setnx("global_userid",1000);
    });

    app.messenger.on('connection', conPlayer => {
        if (!app.userList.has(conPlayer.appName)) {
            app.userList.set(conPlayer.appName, new Map());
        }
        app.logger.info(conPlayer.userInfo.nickName + "connection欢迎回来。。。");
        let player = new EnglishPlayer(conPlayer.userInfo, constant.playerStatus.online, conPlayer.appName);
        app.userList.get(conPlayer.appName).set(player.user.uid, player);
    });

    app.messenger.on('disconnection', disconPlayer => {
        if (!app.userList.has(disconPlayer.appName)) {
            app.userList.set(disconPlayer.appName, new Map());
        }
        if (!app.matchPool.has(disconPlayer.appName)) {
            app.matchPool.set(disconPlayer.appName, new Set());
        }
        let player = app.userList.get(disconPlayer.appName).get(disconPlayer.uid);
        app.matchPool.get(disconPlayer.appName).delete(player);
        app.userList.get(disconPlayer.appName).delete(disconPlayer.uid);

    });


    app.messenger.on('refresh', refreshPlayer => {
        if(!app.matchPool.has(refreshPlayer.appName)){
            app.matchPool.set(refreshPlayer.appName,new Set());
        }
        if (!app.userList.has(refreshPlayer.appName)) {
            app.userList.set(refreshPlayer.appName, new Map());
        }
        let player = app.userList.get(refreshPlayer.appName).get(refreshPlayer.uid);
        const ctx = app.createAnonymousContext();
        if (!player) {
            player = new EnglishPlayer(refreshPlayer.user, constant.playerStatus.online, refreshPlayer.appName);
            app.logger.info(player.user.nickName + "refresh欢迎回来。。。");
            app.userList.get(refreshPlayer.appName).set(player.user.uid, player);
        }

        if (refreshPlayer.ranking) {
            player.setStatus(refreshPlayer.status);
            player.setRankType(refreshPlayer.rankType);
            player.readyWait();
            app.logger.info(player.user.nickName+ " ranking。。。添加到匹配池。。。。");
            app.matchPool.get(refreshPlayer.appName).add(player);
        }
        if (refreshPlayer.user) {
            player.setUser(refreshPlayer.user)
        }

        if (refreshPlayer.round) {
            let roomInfo = app.roomList.get(refreshPlayer.appName).get(refreshPlayer.rid);
            if(!roomInfo){
                return
            }

            if (player.answers.length < refreshPlayer.time) {
                player.setAnswer(refreshPlayer.answer);
                player.setScore(refreshPlayer.score);
                player.setResult(refreshPlayer.isRight);
                //
                let word = roomInfo.wordList[refreshPlayer.time];
                let settime = 20000;
                if(word && word.type == 3 ){
                    settime = 25000
                }
                roomInfo.checkAnswer(settime);
            }


            ctx.runInBackground(async () => {
                app.logger.info("给客户端广播发送答案了。。");
                await ctx.service.englishService.englishService.broadAnswer(refreshPlayer.rid, refreshPlayer.appName, refreshPlayer.time, refreshPlayer.uid);
            });
        }

    });



    app.messenger.on('matchSuccess', matchPoolPlayers => {
        let arr = [];
        for (let uid of matchPoolPlayers.matchPoolPlayer) {
            let player =app.userList.has(matchPoolPlayers.appName)? app.userList.get(matchPoolPlayers.appName).get(uid):null;
            if(!player){
                app.logger.info(uid +"不在线。。重新匹配。。。");
                return
            }
            arr.push(player);
        }
        for (let player of arr) {
            player.finishReady();
         //   player.setRankType(matchPoolPlayers.rankType);
            app.matchPool.get(matchPoolPlayers.appName).delete(player)
        }
        const ctx = app.createAnonymousContext();
        ctx.runInBackground(async () => {
            let englishRoom = new EnglishRoom(matchPoolPlayers.rid, matchPoolPlayers.difficulty, false,ctx);
            englishRoom.ctx = ctx;
            englishRoom.joinRoom(arr[0]);
            englishRoom.joinRoom(arr[1]);
            englishRoom.setWordList(matchPoolPlayers.wordList);
            if (!app.roomList.has(matchPoolPlayers.appName)) {
                app.roomList.set(matchPoolPlayers.appName, new Map());
            }
            app.logger.info("匹配的人 ：" +arr[0].user.nickName+"====="+arr[1].user.nickName);
            app.roomList.get(matchPoolPlayers.appName).set(matchPoolPlayers.rid, englishRoom);
            ctx.service.englishService.englishService.sendMatchInfo(arr, matchPoolPlayers.rid);

        });
    });

    app.messenger.on('matchFailed', info => {
        let player = app.userList.has(info.appName)? app.userList.get(info.appName).get(info.uid):null;
        if (!player) {
            if(!info.isCancel){
                app.logger.info(info.uid +"玩家不在线。。。。");
                return
            }
            player = new EnglishPlayer(info.user, constant.playerStatus.online, info.appName);
            app.logger.info(player.user.nickName + "matchFailed欢迎回来。。。");
            app.userList.get(info.appName).set(player.user.uid, player);
        }
        player.gameFinish();
        if (!app.matchPool.has(info.appName)) {
            app.matchPool.set(info.appName, new Set());
        }
        app.matchPool.get(info.appName).delete(player);
        const ctx = app.createAnonymousContext();


        ctx.runInBackground(async () => {
            ctx.service.englishService.englishService.matchFailed(info.uid,info.isCancel);
        });



    });
    app.messenger.on('setRoom', msg => {
        if (!app.roomList.has(msg.appName)) {
            app.roomList.set(msg.appName, new Map());
        }
        let roomInfo = app.roomList.get(msg.appName).get(msg.rid);
        let firstWord = msg.wordList[0];
        let settime = 20000;
        if(firstWord.type == 3 ){
            settime = 27000
        }
        roomInfo.setFirstTimeOut(settime);
        roomInfo.setWordList(msg.wordList);
        roomInfo.setRoomStatus(constant.roomStatus.isGaming);
        for(let player of roomInfo.userList.values()){
            player.finishReady();
        }
    });





    app.messenger.on('createRoom', roomInfo => {
        if (!app.roomList.has(roomInfo.appName)) {
            app.roomList.set(roomInfo.appName, new Map());
        }
        let player = app.userList.get(roomInfo.appName).get(roomInfo.uid);
        if (!player) {
            player = new EnglishPlayer(roomInfo.user, constant.playerStatus.online, roomInfo.appName);
            app.logger.info(player.user.nickName + "createRoom 欢迎回来。。。");
            app.userList.get(roomInfo.appName).set(player.user.uid, player);
        }
        app.logger.info("我要创建房间");
        const ctx = app.createAnonymousContext();
        let englishRoom = new EnglishRoom(roomInfo.rid, roomInfo.difficulty, true,ctx);
        englishRoom.setWordList(roomInfo.wordList);

        englishRoom.joinRoom(player);
        player.gameFinish();
        player.setInitiator();
        app.roomList.get(roomInfo.appName).set(roomInfo.rid, englishRoom);
        ctx.runInBackground(async () => {
            app.logger.info("准备推送");
            ctx.service.englishService.englishService.notice(roomInfo.appName, roomInfo.rid);
        });
    });



    app.messenger.on('joinRoom', rInfo => {
        if (!app.roomList.has(rInfo.appName)) {
            app.roomList.set(rInfo.appName, new Map());
        }
        let player = app.userList.get(rInfo.appName).get(rInfo.uid);
        if (!player) {
            player = new EnglishPlayer(rInfo.user, constant.playerStatus.online, rInfo.appName);
            app.logger.info(player.user.nickName + "joinRoom 欢迎回来。。。");
            app.userList.get(rInfo.appName).set(player.user.uid, player);
        }
        app.logger.info("我要加入房间");
        const ctx = app.createAnonymousContext();

        let roomInfo = app.roomList.get(rInfo.appName).get(rInfo.rid);
        roomInfo.joinRoom(player,ctx);
        player.gameFinish();
        ctx.runInBackground(async () => {
            app.logger.info("准备推送");
            ctx.service.englishService.englishService.notice(rInfo.appName, rInfo.rid);
        });


    });





    app.messenger.on('leaveRoom', info => {
        if (!app.roomList.has(info.appName)) {
            app.roomList.set(info.appName, new Map());
        }
        const ctx = app.createAnonymousContext();
        let roomList = app.roomList.get(info.appName);
        let isInitiator = false;
        let exchage = false;
        let leaveUid=null;
        for (let [rid, roomInfo] of roomList.entries()) {
            let userList = [];
            for (let [userId, player] of roomInfo.userList.entries()) {
                if (userId == info.uid) {
                    leaveUid=userId;
                    app.logger.info("离开者 ：", userId);
                    if (player.isInitiator) {
                        isInitiator = true;

                    }
                    app.logger.info(roomInfo.isFriend,roomInfo.roomStatus,constant.roomStatus.ready,isInitiator);
                    //如果房间处于准备状态并且 退出者不是房主，执行交换
                    if (roomInfo.isFriend && (roomInfo.roomStatus == constant.roomStatus.ready)) {
                        if(!isInitiator){
                        //    roomInfo.leaveUserList(info.uid);
                        //    player.gameFinish();
                            app.logger.info("选手交换");
                            exchage =true;
                        }else{
                            app.logger.info("退出者为房主。。");
                            player.setInitiator(false);
                            ctx.runInBackground(async () => {
                                ctx.service.englishService.englishService.initiatorLeaveRoom(info.uid,rid,info.appName);
                            });
                            let a = app.roomList.get(info.appName).delete(rid);
                            app.logger.info("我要销毁房间。。" +a);
                        }

                    } else {
                        app.logger.info(roomInfo.roomStatus);
                        app.logger.info("游戏可以结束了。。。");
                        if(roomInfo.roomStatus == constant.roomStatus.isGaming && roomInfo.userList.size ==2){
                            ctx.runInBackground(async () => {
                                await roomInfo.gameEnd(info.uid);
                                if(roomInfo.isGameOver && (!roomInfo.isFriend || isInitiator)){
                                    app.logger.info("销毁房间。。。。");
                                    player.setInitiator(false);
                                    app.roomList.get(info.appName).delete(rid);
                                }


                            });
                        }

                    }


                } else {
                    let user = {
                        info: player.user,
                        isInitiator: player.isInitiator
                    };
                    userList.push(user);
                }
            }
            app.logger.info("是否交换  ："+exchage);
            app.logger.info("选手离开   ："+info.uid);
            if(exchage){
                let leave = roomInfo.leaveUserList(leaveUid);
                app.logger.info("是否是参与者 ："+leave);
                let isBystander =null;
                let bId = null;
                if (leave) {
                    for (let [uid, bystander] of roomInfo.bystander.entries()) {
                        isBystander =bystander;
                        bId = uid;
                        break;
                    }
                    app.logger.info("替补者 :" + bId);
                    if(isBystander !=null && bId !=null){
                        roomInfo.leaveBystander(bId);
                        roomInfo.joinRoom(isBystander);

                    }
                    ctx.runInBackground(async () => {
                        ctx.service.englishService.englishService.notice(info.appName, rid);
                    });

                }
            }

            if (roomInfo.isFriend) {
                if (userList.length == 2) {
                    app.logger.info("旁观者离开了。。。。");
                    let byUid=null;
                    for (let userId of roomInfo.bystander.keys()) {
                        if (userId == info.uid) {
                            byUid = userId;
                            break;

                        }
                    }
                    app.logger.info("旁观者 :" + byUid);
                    if(byUid!=null){
                        roomInfo.leaveBystander(byUid);
                        ctx.runInBackground(async () => {
                            ctx.service.englishService.englishService.notice(info.appName, info.rid);
                        });
                    }

                }
            }


        }
    });


};