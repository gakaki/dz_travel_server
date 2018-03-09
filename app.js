const constant = require("./app/utils/constant");

const utils = require("./app/utils/utils");

const englishConfigs = require("./sheets/english");
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
        let player = app.userList.get(refreshPlayer.appName).get(refreshPlayer.refreshPlayer.user.uid);
        if(refreshPlayer.isOver){
            player.gameFinish();
        }
        if(refreshPlayer.refreshPlayer.status) {
            player.setStatus(refreshPlayer.refreshPlayer.status)
        }
        if(refreshPlayer.refreshPlayer.score) {
            player.setScore(refreshPlayer.refreshPlayer.score)
        }
        if(refreshPlayer.refreshPlayer.rankType) {
            player.setRankType(refreshPlayer.refreshPlayer.rankType)
        }
        if(refreshPlayer.refreshPlayer.answer) {
            player.setAnswer(refreshPlayer.refreshPlayer.answer)
        }
        if(refreshPlayer.refreshPlayer.isRight) {
            player.setResult(refreshPlayer.refreshPlayer.isRight)
        }
        if(refreshPlayer.refreshPlayer.isInitiator) {
            player.setInitiator()
        }
        if(refreshPlayer.refreshPlayer.user) {
            player.setUser(refreshPlayer.refreshPlayer.user)
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
            let roomId = "10" + new Date().getTime();
            let englishRoom = new EnglishRoom(roomId,matchPoolPlayers.difficulty,false);
            englishRoom.joinRoom(arr[0]);
            englishRoom.joinRoom(arr[1]);
            englishRoom.setWordList(matchPoolPlayers.wordList);
            if(!app.roomList.has(matchPoolPlayers.appName)){
                app.roomList.set(matchPoolPlayers.appName,new Map());
            }
            app.roomList.get(matchPoolPlayers.appName).set(roomId,englishRoom);
             ctx.service.englishService.englishService.matchSuccess(arr,roomId);

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
        if(roomInfo.isFriend){
            roomInfo.setRoomStatus(constant.roomStatus.ready);
        }
        for(let player of roomInfo.userList.values()){
            player.gameFinish();
        }
        const ctx = app.createAnonymousContext();
        ctx.runInBackground(async () => {
            ctx.service.englishService.englishService.pkEnd(pkinfo.rid,pkinfo.appName,pkinfo.leaveUid);
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

    app.messenger.on('exchange',rInfo =>{
        if(!app.roomList.has(rInfo.appName)){
            app.roomList.set(rInfo.appName,new Map());
        }
        let roomInfo = app.roomList.get(rInfo.appName).get(rInfo.rid);
        if(roomInfo.userList.size <2){
            for (let [uid,bystander] of roomInfo.bystander.entries()){
                roomInfo.leaveBystander(uid);
                roomInfo.joinRoom(bystander);
                break;
            }
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

        const ctx = app.createAnonymousContext();
        ctx.runInBackground(async () => {
            ctx.service.englishService.englishService.exchange(rInfo.appName,rInfo.rid,userList,rinfo);
        });


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
            for(let [userId,player] of roomInfo.userList.entries()){
                if(userId == info.uid){
                    if(player.isInitiator){
                        isInitiator = true
                    }
                    ctx.runInBackground(async () => {
                        ctx.service.englishService.englishService.leaveRoom(info.uid,rid,info.appName,isInitiator);
                    });

                }
            }
        }
    });



    app.messenger.on('delRoom',roomInfo =>{
        app.roomList.get(roomInfo.appName).delete(roomInfo.rid);
    });




};