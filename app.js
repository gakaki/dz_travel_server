const constant = require("./app/utils/constant");
const EnglishPlayer = require("./app/io/player/englishPlayer/englishPlayer");
const EnglishRoom = require("./app/io/room/englishRoom/englishRoom");

module.exports = app => {
    app.beforeStart(async () => {
        // 应用会等待这个函数执行完成才启动
       app.userList=new Map();
       app.matchPool=new Map();
       app.roomList=new Map();
    });

    app.messenger.on('connection',conPlayer =>{
        if(!app.userList.has(conPlayer.appName)){
            app.userList.set(conPlayer.appName,new Map());
        }
        let player = new EnglishPlayer(conPlayer.userInfo, constant.playerStatus.online, conPlayer.appName);
        app.userList.get(conPlayer.appName).set(player.user.uid,player);
    });

    app.messenger.on('disconnection',disconPlayer =>{
        if(!app.userList.has(disconPlayer.appName)){
            app.userList.set(disconPlayer.appName,new Map());
        }
        if(!app.matchPool.has(disconPlayer.appName)){
            app.matchPool.set(disconPlayer.appName,new Set());
        }
        let player=app.userList.get(disconPlayer.appName).get(disconPlayer.uid);
        app.matchPool.get(disconPlayer.appName).delete(player);
        app.userList.get(disconPlayer.appName).delete(disconPlayer.uid);

    });


    app.messenger.on('refresh', refreshPlayer=>{
        let player = app.userList.get(refreshPlayer.appName).get(refreshPlayer.uid);
        console.log("准备全局更新");
        if(player){
            if(refreshPlayer.ranking){
            //    console.log("段位 ：",refreshPlayer.rankType);
                player.setStatus(refreshPlayer.status);
                player.setRankType(refreshPlayer.rankType)
            }

            if(refreshPlayer.round){
               console.log("分数 ：" ,refreshPlayer.score);
                console.log("回答 ：",refreshPlayer.answer);
                console.log("本轮是否获胜 ：",refreshPlayer.isRight);

                if(player.answers.length< refreshPlayer.time){
                    player.setAnswer(refreshPlayer.answer);
                    player.setScore(refreshPlayer.score);
                    player.setResult(refreshPlayer.isRight);
                }

            }
            if(refreshPlayer.user){
                player.setUser(refreshPlayer.user)
            }

            if(refreshPlayer.isFriend){
                player.setInitiator()
            }
            if(refreshPlayer.isOver){
                player.gameFinish();
            }
        }



    });

    app.messenger.on('readyMatch',matchPlayer =>{
        if(!app.matchPool.has(matchPlayer.appName)){
            app.matchPool.set(matchPlayer.appName,new Set());
        }
        let player = app.userList.get(matchPlayer.appName).get(matchPlayer.player);
        player.readyWait();
        app.matchPool.get(matchPlayer.appName).add(player);
    });

    app.messenger.on('matchSuccess',matchPoolPlayers =>{
        let arr=[];
        for(let uid of matchPoolPlayers.matchPoolPlayer){
            arr.push(app.userList.get(matchPoolPlayers.appName).get(uid))
        }
        for(let player of arr){
            player.finishReady();
            app.matchPool.get(matchPoolPlayers.appName).delete(player)
        }
        const ctx = app.createAnonymousContext();
        ctx.runInBackground(async () => {
            let englishRoom = new EnglishRoom(matchPoolPlayers.rid,matchPoolPlayers.difficulty,false);
            englishRoom.joinRoom(arr[0]);
            englishRoom.joinRoom(arr[1]);
            englishRoom.setWordList(matchPoolPlayers.wordList);
            if(!app.roomList.has(matchPoolPlayers.appName)){
                app.roomList.set(matchPoolPlayers.appName,new Map());
            }
            app.roomList.get(matchPoolPlayers.appName).set(matchPoolPlayers.rid,englishRoom);
             ctx.service.englishService.englishService.matchSuccess(arr,matchPoolPlayers.rid);

        });
    });

    app.messenger.on('matchFailed',info =>{
        let player = app.userList.get(info.appName).get(info.uid);
        player.gameFinish();
        if(!app.matchPool.has(info.appName)){
            app.matchPool.set(info.appName,new Set());
        }
        app.matchPool.get(info.appName).delete(player);
        if(!info.isCancel){
            const ctx = app.createAnonymousContext();
            ctx.runInBackground(async () => {
                ctx.service.englishService.englishService.matchFailed(info.uid);
            });
        }

    });

    app.messenger.on('pkend',pkinfo => {
        if(!app.roomList.has(pkinfo.appName)){
            app.roomList.set(pkinfo.appName,new Map());
        }
        let roomInfo =  app.roomList.get(pkinfo.appName).get(pkinfo.rid);

        const ctx = app.createAnonymousContext();
        ctx.runInBackground(async () => {
            await ctx.service.englishService.englishService.pkEnd(pkinfo.rid,pkinfo.appName,pkinfo.leaveUid);
            for(let player of roomInfo.userList.values()){
                player.gameFinish();
          //      console.log(player);
            }
            app.roomList.get(pkinfo.appName).delete(pkinfo.rid);
        });



    });



    app.messenger.on('createRoom',roomInfo =>{
        if(!app.roomList.has(roomInfo.appName)){
            app.roomList.set(roomInfo.appName,new Map());
        }
        let englishRoom = new EnglishRoom(roomInfo.rid,roomInfo.difficulty,true);
        app.roomList.get(roomInfo.appName).set(roomInfo.rid,englishRoom);
    });

    app.messenger.on('setRoom',roomInfo =>{
        if(!app.roomList.has(roomInfo.appName)){
            app.roomList.set(roomInfo.appName,new Map());
        }
        let englishRoom =  app.roomList.get(roomInfo.appName).get(roomInfo.room.rid);
        if(roomInfo.room.wordList){
            englishRoom.setWordList(roomInfo.room.wordList);
        }
        if(roomInfo.isOver){
            if(englishRoom.isFriend){
                englishRoom.setRoomStatus(constant.roomStatus.ready);
            }
        }
    });



    app.messenger.on('joinRoom',rInfo =>{
        if(!app.roomList.has(rInfo.appName)){
            app.roomList.set(rInfo.appName,new Map());
        }
        let player = app.userList.get(rInfo.appName).get(rInfo.uid);
        let roomInfo = app.roomList.get(rInfo.appName).get(rInfo.rid);
        roomInfo.joinRoom(player);

    });

    app.messenger.on('leaveRoom',info =>{
        if(!app.roomList.has(info.appName)){
            app.roomList.set(info.appName,new Map());
        }
        const ctx = app.createAnonymousContext();
        let roomList = app.roomList.get(info.appName);
        let isInitiator = false;
        for(let [rid,roomInfo] of roomList.entries()){
            let userList=[];
            for(let [userId,player] of roomInfo.userList.entries()){
                if(userId == info.uid){
                    if(player.isInitiator){
                        isInitiator = true
                    }
                    //如果房间处于准备状态并且 退出者不是房主，执行交换
                    if(roomInfo.isFriend && roomInfo.roomStatus == constant.roomStatus.ready && !isInitiator){
                        let leave = roomInfo.leaveUserList(info.uid);
                        if(leave){
                            for (let [uid,bystander] of roomInfo.bystander.entries()){
                                roomInfo.leaveBystander(uid);
                                roomInfo.joinRoom(bystander);
                                break;
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
                            ctx.runInBackground(async () => {
                                ctx.service.englishService.englishService.notice(info.appName,rid,userList,rinfo);
                            });
                        }
                    }else{
                        ctx.runInBackground(async () => {
                            let result = await ctx.service.englishService.englishService.leaveRoom(info.uid,rid,info.appName,isInitiator);
                            player.gameFinish();
                            if(result){
                                app.roomList.get(info.appName).delete(rid);
                            }
                        });
                    }


                }else{
                    let user={
                        info :player.user,
                        isInitiator:player.isInitiator
                    };
                    userList.push(user);
                }
            }

            if(userList.length == 2){
                if(roomInfo.isFriend){
                    for(let userId of roomInfo.bystander.keys()){
                        if(userId == info.uid){
                            roomInfo.leaveBystander(userId);
                            let rinfo={
                                userList:userList,
                                bystanderCount:roomInfo.bystander.size,
                                rid:rid,
                                isFriend:true,
                                roomStatus:roomInfo.roomStatus
                            };
                            ctx.runInBackground(async () => {
                                ctx.service.englishService.englishService.notice(info.appName,info.rid,userList,rinfo);
                            });

                        }
                    }
                }
            }


        }
    });






};