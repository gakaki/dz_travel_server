const Service = require('egg').Service;
const EnglishRoom = require('../../io/room/englishRoom/englishRoom');
const constant = require("../../utils/constant");
const utils = require("../../utils/utils");
const englishConfigs = require("../../../sheets/english");

class EnglishService extends Service {
    async matchSuccess(matchPoolPlayer) {
        let mplayers = Array.from(matchPoolPlayer);
        let rankA= mplayers[0].rankType;
        let rankB= mplayers[1].rankType;
        let roomId = "10" + new Date().getTime();
        let pk = Math.min(rankA,rankB);
        let difficulty = englishConfigs.Stage.Get(pk).difficulty;
        let index = utils.Rangei(0,difficulty.length);
        let wordList=this.setQuestions(difficulty[index]);
        this.logger.info("匹配成功 ："+roomId);
        let uidArr=[mplayers[0].user.uid,mplayers[1].user.uid];
        this.app.messenger.sendToApp('matchSuccess',{appName:constant.AppName.ENGLISH,matchPoolPlayer:uidArr,rid:roomId,wordList:wordList,difficulty:difficulty[index]});
    }

    async sendMatchInfo(matchPoolPlayer, roomId){
        let englishroom = this.app.roomList.get(constant.AppName.ENGLISH).get(roomId);
        this.logger.info("发送匹配信息 ：" + roomId);
        this.logger.info(matchPoolPlayer.length);
        let firstWord = englishroom.wordList[0];
        let settime = 200000;
        if(firstWord.type == 3 ){
            settime = 270000
        }
        englishroom.setFirstTimeOut(settime);
        for (let player of matchPoolPlayer) {
            let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, player.user.uid);
            this.logger.info("是否获取到socket"+socket);
            if (socket) {
                socket.join(roomId);
                let uList = [];
                for (let player of englishroom.userList.values()) {
                    let user = {
                        info: player.user,
                        isInitiator: player.isInitiator
                    };
                    uList.push(user);
                }
                this.logger.info(player.user.nickName + "当前选择 为：" + player.rankType + "花费金币 L:" + englishConfigs.Stage.Get(player.rankType).goldcoins1);


                let cost = {
                    ["items." + englishConfigs.Item.GOLD]: (englishConfigs.Stage.Get(player.rankType).goldcoins1) * -1
                };
                 await this.ctx.model.PublicModel.User.update({
                    uid: player.user.uid,
                    appName: constant.AppName.ENGLISH
                }, {$inc: cost});
                this.logger.info(player.user.nickName+"推送消息");
                socket.emit("matchSuccess",{
                    code: constant.Code.OK,
                    data: {
                        userList: uList,
                        rid: roomId
                    }
                })
                 this.ctx.service.publicService.itemService.itemChange(player.user, cost, constant.AppName.ENGLISH);
                /* socket.emit('joinSuccess', {
                     code: constant.Code.OK,
                 });*/





                // setTimeout(function () {
                //  this.logger.info("matchSuccess ："+englishroom.rid);
            //    let nsp =this.app.io.of('/english');

                /*     nsp.to(roomId).emit("matchSuccess", {

                     })*/
                // },500)
            }
        }
    }

    matchFailed(uid) {
        let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, uid);
        if (socket) {
            socket.emit("matchFailed", {
                code: constant.Code.REQUIRED_LOST
            });
        }

    }


    async showPersonal(ui, appName) {
        let date = new Date().toLocaleDateString();
        let answerRecords = await this.ctx.model.EnglishModel.EnglishAnswerRecord.find({uid: ui.uid, date: date});
        let todayWords = new Set();
        let rightCount = 0;
        let newWord = 0;
        let wordList = ui.character.wordList;
        let wordArr = [];
        let totalWord=[];
        for (let date in wordList) {
            totalWord.push(...wordList[date]);
            if(date != new Date().toLocaleDateString()){
                wordArr.push(...wordList[date]);
            }
        }

        let totalWordLib = new Set(totalWord);
        let wordLib = new Set(wordArr);
        for (let record of answerRecords) {
            todayWords.add(record.wid);
            if (!wordLib.has(record.wid)) {
                newWord++;
                wordLib.add(record.wid);
            }
            if (record.isRight) {
                rightCount++;
            }
        }

        if (Object.keys(ui.items).length < englishConfigs.items.length) {
            let items = {};
            for (let item of englishConfigs.items) {
                if (!ui.items[item.id]) {
                    items["items." + item.id] = 0;
                }
            }

            await this.ctx.model.PublicModel.User.update({uid: ui.uid, appName: appName}, {$set: items});
            ui = await this.ctx.model.PublicModel.User.findOne({uid: ui.uid, appName: appName});
        }
        // let answerCount = await this.ctx.model.EnglishModel.EnglishAnswerRecord.count({uid:ui.uid,date:date});

        let landingessay = ui.character.beautifulWords;
        let beautifulWord ={
            english :englishConfigs.Landingessay.Get(landingessay).English,
            chinese:englishConfigs.Landingessay.Get(landingessay).Chinese
        };


        let result = {
            userInfo: ui,
            beautifulWord:beautifulWord,
            todayWords: todayWords.size,
            remember: {
                totalCount: answerRecords.length,
                rightCount: rightCount
            },
            newWord: {
                totalWordCount: totalWordLib.size,
                newWordCount: newWord
            }
        };

        return result;

    }

    async updatePosition(ui, appName, position) {
        if (ui.location != position) {
            await this.ctx.model.PublicModel.User.update({uid: ui.uid, appName: appName}, {$set: {location: position}});
        }
        return await this.ctx.model.PublicModel.User.findOne({uid: ui.uid, appName: appName})
    }


    async isFirstSign(ui, appName) {
        let signCount = await this.ctx.model.PublicModel.SignInRecord.count({
            uid: ui.uid,
            appName: appName,
            createDate: new Date().toLocaleDateString()
        });
        let isFirst = true;
        if (signCount > 0) {
            isFirst = false
        }

        let cumulativeDays = (ui.character.cumulativeDays + 1);
        let day = cumulativeDays % 7;
        if (day == 0) {
            day = 7
        }

        return {
            day: day,
            isFirst: isFirst
        };
    }

    async signIn(ui, appName) {
        let signCount = await this.ctx.model.PublicModel.SignInRecord.count({
            uid: ui.uid,
            appName: appName,
            createDate: new Date().toLocaleDateString()
        });
        if (signCount > 0) {
            return null;
        }

        let cumulativeDays = (ui.character.cumulativeDays + 1);
        let day = cumulativeDays % 7;
        if (day == 0) {
            day = 7
        }
        let cost = {
            ["character.cumulativeDays"]: 1,
            ["character.beautifulWords"]: 1,
        };
        let items = {};
        let reward = englishConfigs.Landing.Get(day).itemid;

        for (let item of reward) {
            cost["items." + item.k] = Number(item.v);
            items["items." + item.k] = Number(item.v)
        }
        await this.ctx.model.PublicModel.SignInRecord.create({
            uid: ui.uid,
            appName: appName,
            createDate: new Date().toLocaleDateString(),
            createTime: new Date().toLocaleTimeString()
        });
        await this.ctx.model.PublicModel.User.update({uid: ui.uid, appName: appName}, {$inc: cost});
        await this.ctx.service.publicService.itemService.itemChange(ui, items, appName);

        return {
            day: day,
            reward: reward
        };
    }

    async canShare(ui, appName) {
        let createDate = new Date().toLocaleDateString();
        let count = await this.ctx.model.PublicModel.UserShareRecord.count({
            uid: ui.uid,
            createDate: createDate,
            appName: appName
        });
        let canShare = {};
        let season = this.getSeason();
        if (count < englishConfigs.Constant.Get(englishConfigs.Constant.SHARENUM).value) {
            canShare.canShare = true;
            canShare.num = englishConfigs.Stage.Get(ui.character.season[season].rank).goldcoins1;
            canShare.itemId = englishConfigs.Item.GOLD;
        } else {
            canShare.canShare = false;
        }
        return canShare;
    }

    async getShareAward(ui, appName) {
        let createDate = new Date().toLocaleDateString();
        let count = await this.ctx.model.PublicModel.UserShareRecord.count({
            uid: ui.uid,
            createDate: createDate,
            appName: appName
        });
        let userShareRecord = {
            uid: ui.uid,
            appName: appName,
            createTime: new Date().toLocaleTimeString(),
            createDate:  new Date().toLocaleDateString(),
        };
        let season = this.getSeason();
        if (count < englishConfigs.Constant.Get(englishConfigs.Constant.SHARENUM).value) {
            let delta = {
                ["items." + englishConfigs.Item.GOLD]: englishConfigs.Stage.Get(ui.character.season[season].rank).goldcoins1
            };
            await this.ctx.model.PublicModel.User.update({uid: ui.uid, appName: appName}, {$inc: delta});
            ui = await this.ctx.model.PublicModel.User.findOne({uid: ui.uid, appName: appName});
            await this.ctx.service.publicService.itemService.itemChange(ui, delta, appName);

            userShareRecord.num = englishConfigs.Stage.Get(ui.character.season[season].rank).goldcoins1;
            userShareRecord.getItem = true;
            userShareRecord.itemId = englishConfigs.Item.GOLD;
        } else {
            userShareRecord.num = englishConfigs.Stage.Get(ui.character.season[season].rank).goldcoins1;
            userShareRecord.getItem = false;
            userShareRecord.itemId = englishConfigs.Item.GOLD;
        }
        this.ctx.model.PublicModel.UserShareRecord.create(userShareRecord);

        return userShareRecord;
    }

    isInRoom(ui,appName,rankType){
        let needGold = false;
        let inRoom = false;
        let cost =englishConfigs.Stage.Get(rankType).goldcoins1;
        if(ui.items[englishConfigs.Item.GOLD] < cost){
            needGold = true;
        }
        let roomList = this.app.roomList.has(appName)?this.app.roomList.get(appName):new Map();
        for(let room of roomList.values()){
            for(let uid of room.userList.keys()){
                if(uid == ui.uid && room.isFriend){
                    this.logger.info(uid,room.rid,room.isFriend);
                    inRoom = true;
                    break;
                }
            }
        }
        return {
            needGold:needGold,
            inRoom:inRoom
        }
    }

    checkRoom(ui,appName,rid){
        let roomExist = true;
        let inRoom = false;
        let isFriend = false;
        let roomInfo =this.app.roomList.has(appName)?this.app.roomList.get(appName).get(rid):null;
        if(!roomInfo){
            roomExist=false;
        }else{
            this.logger.info("checkRoom 检查房间时 " +JSON.stringify(roomInfo));
            if(roomInfo.isFriend){
                isFriend = true;
            }
            for(let uid of roomInfo.userList.keys()){
                if(uid == ui.uid){
                    inRoom = true;
                    break;
                }
            }
        }

        return {
            rid:rid,
            roomExist:roomExist,
            inRoom:inRoom,
            isFriend:isFriend
        }
    }


    roomIsExist(ui, appName, rid) {
        let roomInfo=this.app.roomList.has(appName) ? this.app.roomList.get(appName).get(rid) : null;
        if(!roomInfo){
            return null;
        }else{
            if(roomInfo.userList.size == 2){
                return null;
            }else{
                return roomInfo;
            }
        }
    }

    async makeSurprise(ui, appName, itemId) {
        let drop = englishConfigs.Item.Get(itemId).drop;  //掉落物品
        let cost = {
            ["items." + itemId]: -1,
        };
        let result = {};
        let randomdropIDs = englishConfigs.Drop.Get(drop).randomdropID;
        for (let randomItem of randomdropIDs) {
            for (let i = 0; i < Number(randomItem.v); i++) {
                let randomDrop = englishConfigs.Randomdrop.Get(randomItem.k).drop;
                let index = utils.Rangei(0, randomDrop.length);
                let num = cost["items." + randomDrop[index].k];
                if (num) {
                    cost["items." + randomDrop[index].k] = Number(randomDrop[index].v) + num;
                    result[randomDrop[index].k] = Number(randomDrop[index].v) + num;
                } else {
                    cost["items." + randomDrop[index].k] = Number(randomDrop[index].v);
                    result[randomDrop[index].k] = Number(randomDrop[index].v);
                }

            }

        }
        await this.ctx.model.PublicModel.User.update({uid: ui.uid, appName: appName}, {$inc: cost});
        await this.ctx.service.publicService.itemService.itemChange(ui, cost, constant.AppName.ENGLISH);
        return result;

    }

    develop(ui) {
        let developSys = ui.character.developSystem;
        let items = ui.items;
        let speechs = {};
        for (let dev in developSys) {
            let sp = {
                level: developSys[dev].level,
                plus: developSys[dev].plus,
                nextPlus: (developSys[dev].level + 1) * (englishConfigs.Speech.Get(dev).add) / 100,
                canUp: false,
                levelUP: {
                    needI: developSys[dev].consume[englishConfigs.Item[developSys[dev].speech.toUpperCase()]],
                    haveI: items[englishConfigs.Item[developSys[dev].speech.toUpperCase()]],
                    needG: developSys[dev].consume[englishConfigs.Item.GOLD],
                    havaG: items[englishConfigs.Item.GOLD],
                }
            };

            if (sp.levelUP.haveI >= sp.levelUP.needI && sp.levelUP.havaG >= sp.levelUP.needG) {
                sp.canUp = true;
            }
            if (developSys[dev].level == englishConfigs.Speech.Get(dev).endlevel) {
                sp.canUp = false;
            }
            speechs[dev] = sp;
        }
        return speechs;
    }

    async speechLevelUp(ui, id, appName) {
        let upSpeech = ui.character.developSystem[id];
        let speech = upSpeech.speech;
        this.logger.info("有道具 ：" + ui.items[englishConfigs.Item[upSpeech.speech.toUpperCase()]]);
        this.logger.info("需要的 ：" + upSpeech.consume[englishConfigs.Item[upSpeech.speech.toUpperCase()]]);
        this.logger.info("有金币 ：" + ui.items[englishConfigs.Item.GOLD]);
        this.logger.info("需要的 ：" + upSpeech.consume[englishConfigs.Item.GOLD]);
        if ((ui.items[englishConfigs.Item.GOLD] < upSpeech.consume[englishConfigs.Item.GOLD]) || (ui.items[englishConfigs.Item[upSpeech.speech.toUpperCase()]] < upSpeech.consume[englishConfigs.Item[upSpeech.speech.toUpperCase()]])) {
            return null;
        }

        let cost = {
            ["items." + englishConfigs.Item.GOLD]: (upSpeech.consume[englishConfigs.Item.GOLD]) * -1,
            ["items." + englishConfigs.Item[speech.toUpperCase()]]: (upSpeech.consume[englishConfigs.Item[speech.toUpperCase()]]) * -1,
            ["character.developSystem." + id + ".level"]: 1,
            ["character.developSystem." + id + ".plus"]: (englishConfigs.Speech.Get(id).add) / 100,
            ["character.developSystem." + id + ".consume." + englishConfigs.Item[speech.toUpperCase()]]: (englishConfigs.Speech.Get(id).addconsume1),
            ["character.developSystem." + id + ".consume." + englishConfigs.Item.GOLD]: (englishConfigs.Speech.Get(id).addconsume2)
        };

        let delta = {
            ["items." + englishConfigs.Item.GOLD]: (upSpeech.consume[englishConfigs.Item.GOLD]) * -1,
            ["items." + englishConfigs.Item[speech.toUpperCase()]]: (upSpeech.consume[englishConfigs.Item[speech.toUpperCase()]]) * -1,
        };
        await this.ctx.model.PublicModel.User.update({uid: ui.uid, appName: appName}, {$inc: cost});
        let user = await this.ctx.model.PublicModel.User.findOne({uid: ui.uid, appName: appName});
        await this.ctx.service.publicService.itemService.itemChange(ui, delta, constant.AppName.ENGLISH);
        let up = user.character.developSystem[id];
        let items = user.items;
        let sp = {
            level: up.level,
            plus: up.plus,
            nextPlus: (up.level + 1) * (englishConfigs.Speech.Get(id).add) / 100,
            canUp: false,
            levelUP: {
                needI: up.consume[englishConfigs.Item[up.speech.toUpperCase()]],
                haveI: items[englishConfigs.Item[up.speech.toUpperCase()]],
                needG: up.consume[englishConfigs.Item.GOLD],
                havaG: items[englishConfigs.Item.GOLD],
            }
        };
        if (sp.levelUP.haveI >= sp.levelUP.needI && sp.levelUP.havaG >= sp.levelUP.needG) {
            sp.canUp = true;
        }
        if (up.level == englishConfigs.Speech.Get(id).endlevel) {
            sp.canUp = false;
        }
        return sp;
    }


    async getFriendRankingList(ui, appName) {
        let userList = ui.character.friendsList;
        let uList = [];
        let season = this.getSeason();
        let lastRank = 1;
        let lastseason = season-1;
        if(ui.character.season[lastseason]){
            lastRank = ui.character.season[lastseason].rank;
        }
        uList.push({
            uid: ui.uid,
            appName: appName,
            nickName: ui.nickName,
            avatarUrl: ui.avatarUrl,
            city: ui.city,
            lastRank:lastRank,
            rank: ui.character.season[season].rank,
            star: ui.character.season[season].star,
            createTime: ui.character.season[season].createTime
        });
        for (let userId of userList) {
            let user = await this.ctx.model.PublicModel.User.findOne({uid: userId, appName: appName});
            if (user.character.season[season]) {
                if(user.character.season[lastseason]){
                   lastRank = user.character.season[lastseason].rank;
                }
                let friend = {
                    uid: user.uid,
                    appName: appName,
                    nickName: user.nickName,
                    avatarUrl: user.avatarUrl,
                    city: user.city,
                    lastRank:lastRank,
                    rank: user.character.season[season].rank,
                    star: user.character.season[season].star,
                    createTime: user.character.season[season].createTime
                };
                uList.push(friend);
            }
        }

        let sortList = utils.multisort(uList,
            (a, b) => b["rank"] - a["rank"],
            (a, b) => b["star"] - a["star"],
            (a, b) => a["createTime"] - b["createTime"]);

        return sortList.slice(0, 151);
    }

    async getWorldRankingList(appName, season) {
        let nowSeason = this.getSeason();
        if (season) {
            if (nowSeason == 1) {
                return null;
            } else {
                nowSeason -= 1;
            }

        }
        let lastRank = 1;
        let lastseason = season-1;

        let allUser = await this.ctx.model.PublicModel.User.find({appName: appName});
        let seasonList = [];
        for (let user of allUser) {
            if (user.character.season[nowSeason]) {
                if(user.character.season[lastseason]){
                    lastRank = user.character.season[lastseason].rank;
                }
                let player = {
                    uid: user.uid,
                    appName: appName,
                    nickName: user.nickName,
                    avatarUrl: user.avatarUrl,
                    city: user.city,
                    lastRank:lastRank,
                    rank: user.character.season[nowSeason].rank,
                    star: user.character.season[nowSeason].star,
                    createTime: user.character.season[nowSeason].createTime
                };
                seasonList.push(player);
            }
        }
        let sortList = utils.multisort(seasonList,
            (a, b) => b["rank"] - a["rank"],
            (a, b) => b["star"] - a["star"],
            (a, b) => a["createTime"] - b["createTime"]);

        return sortList.slice(0, 101);
    }

    getSeason() {
        let date = new Date();
        let seasons = englishConfigs.seasons;
        for (let season of seasons) {
            if (date >= new Date(season.star) && date <= new Date(season.end)) {
                return season.id
            }
        }
    }

    setQuestions(difficulty) {
        let wordLib = englishConfigs.words;
        let words = [];
        for (let word of wordLib) {
            if (word.difficulty == difficulty) {
                words.push(word);
            }
        }
        return this.getWord(words);
    }

    getWord(words) {
        let indexs = new Set();
        while (indexs.size < 5) {
            let index = utils.Rangei(0, words.length);
            indexs.add(index);
        }
        let questions = [];
        for (let i of indexs) {
            let qword = words[i];
            let types = qword.type;
            let type = utils.Rangei(0, types.length);
            //  let type = 1;
            let word = {
                id: qword.id,
                english:qword.english,
                chinese:qword.China,
                symbol:qword.symbol,
                speech:qword.speech,
                type: types[type],
                eliminateNum:qword.eliminateNum,
                eliminate:qword.eliminate,
            };
            if(word.type == 1 ||word.type ==2){
                word.errorWords = this.getErrorAnswer(qword.id,words)
            }

            questions.push(word);
        }

        return questions;
    }

    getErrorAnswer(wid,wordLib){
       // let wordLib = englishConfigs.words;
      // let errorWords = [];
        let words = new Set();
        while(words.size <3){
            let index = utils.Rangei(0, wordLib.length);
            if(index != wid){
                let word = {
                    id: wordLib[index].id,
                    english:wordLib[index].english,
                    chinese:wordLib[index].China,
                };
                words.add(word);
            }
        }

        return Array.from(words);
    }

    async doComplete(orderid, appName) {
        let rcd = await this.ctx.model.WeChatModel.RechargeRecord.findOne({
            orderid: orderid,
            close: true,
            appName: appName
        });
        this.logger.info("修改预下单状态 ：" + JSON.stringify(rcd));
        if (rcd == null) {
            return false;
        }
        let ui = await this.ctx.model.PublicModel.User.findOne({pid: rcd.pid, appName: appName});
        //修改数据库;
        let good = englishConfigs.Shop.Get(rcd.good);
        this.logger.info("商品 :", good);
        let cost = {
            ["items." + good.itemid.k]: Number(good.itemid.v)
        };
        await this.ctx.model.PublicModel.User.update({uid: ui.uid, appName: appName}, {$inc: cost});
        ui = await this.ctx.model.PublicModel.User.findOne({pid: rcd.pid, appName: appName});
        await this.ctx.service.publicService.itemService.itemChange(ui, cost, appName);
        let socket = this.ctx.service.socketService.socketioService.getSocket(appName, ui.uid);
        if (socket) {
            socket.emit("getItem", {
                code: constant.Code.OK,
                data: {
                    [rcd.good]: ui.items[good.itemid.k]
                }
            })
        }
        return true;
    }


    async initiatorLeaveRoom(uid, rid, appName) {
        let roomInfo = this.app.roomList.get(appName).get(rid);
        this.logger.info("房主离开了,通知其他人房间解散");
        //通知其他人离开
    //    let nsp = this.app.io.of("/english");
        for (let userId of roomInfo.userList.keys()) {
            if (userId != uid) {
                let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, userId);
                if (socket) {
                    this.logger.info("兄弟们该撤了");

                    socket.emit("dissolve", {
                        code: constant.Code.OK,
                    });
                    socket.leave(rid);
                }

            }
        }
        for (let bystander of roomInfo.bystander.keys()) {
            let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, bystander);
            if (socket) {
                this.logger.info("不看戏了。。。。");
                socket.emit("dissolve", {
                    code: constant.Code.OK,
                });
                socket.leave(rid);
            }
        }

    }

    notice(appName, rid) {
        let roomInfo = this.app.roomList.get(appName).get(rid);
        let uList = [];
        if(!roomInfo){
            return
        }
        for (let player of roomInfo.userList.values()) {
            this.logger.info("循环的用户信息  ：" ,JSON.stringify(player.user));
            let user = {
                info: player.user,
                isInitiator: player.isInitiator
            };
            uList.push(user);
        }

        let rInfo = {
            userList: uList,
            bystanderCount: roomInfo.bystander.size,
            rid: rid,
            isFriend: true,
            roomStatus: roomInfo.roomStatus
        };
        this.logger.info("消息通知。。。");
        this.logger.info("用户信息 ：" ,uList);
        this.logger.info("房间信息  ：" ,rInfo);
        let nsp = this.app.io.of("/english");
        nsp.to(rid).emit('roomInfo', {
            code: constant.Code.OK,
            data: {
                userList: uList,
                roomInfo: rInfo
            }
        });

    }



    async broadAnswer(rid, appName, time, uid) {
        let roomInfo = this.app.roomList.get(appName).get(rid);
        if (!roomInfo) {
            this.logger.info("roundend :没拿到房间信息");
            return;
        }
        let ulist = [];
        let answers = [];
        for (let play of roomInfo.userList.values()) {
            answers.push(play.answers.length);
            ulist.push({
                info: play.user,
                rid: rid,
                isInitiator: play.isInitiator,
                score: play.score,
                continuousRight: play.continuousRight,
                playerAnswer: play.answer
            })
        }
        let ok = true;
        this.logger.info(answers);
        for (let okl of answers) {
            if (okl != time) {
                ok = false;
                break;
            }
        }
        this.logger.info(ok);

        this.logger.info("当前次数 ：" + time);

        const nsp = this.app.io.of("/english");
        nsp.to(rid).emit('roundEndSettlement', {
            code: constant.Code.OK,
            data: {
                round: time,
                userList: ulist,
            }
        });

        return {
            code: ok
        };



    }

    async roundEndNotice(rid,time) {
            const nsp = this.app.io.of("/english");
            this.logger.info("准备进行下一轮 =======  ");
            nsp.to(rid).emit('nextRound', {
                code: constant.Code.OK,
                data:{
                    round:time
                }

            });


    }

    async pkEnd(rid, appName, leaveUid) {
        this.logger.info("对战结束。。。");
        this.logger.info("有离开者吗？？"+leaveUid);
        let isLeave = false;
        if (leaveUid != null) {
            isLeave = true;
        }
        let roomMangerLeave = false;
        let roomInfo = this.app.roomList.get(appName).get(rid);
        if(!roomInfo){
            return
        }
        for (let player of roomInfo.userList.values()) {
            this.logger.info("不循环？？？"+player.user.nickName);
            let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, player.user.uid);
            if (socket) {
                this.logger.info("结算。。");
                let result = roomInfo.gameover(player.user.uid, roomInfo.isFriend, isLeave, leaveUid);
                let season = this.getSeason();
                let user = player.user;
                let rankType = player.rankType;

                //   this.logger.info(player.user.nickName +"本轮成绩 ：" ,result);
                let items = {
                    ["items." + englishConfigs.Item.GOLD]: result.gold
                };
                let cost = {
                    ["character.wins"]: result.wins,
                    ["character.losses"]: result.losses,
                    ["character.total"]: result.total,
                    ["items." + englishConfigs.Item.GOLD]: result.gold
                };


                let winningStreak = user.character.winningStreak;
                let rank = user.character.season[season] ? user.character.season[season].rank : 1;
                let star = user.character.season[season] ? user.character.season[season].star : 0;
                let exp = user.character.experience.exp;
                let needExp = user.character.experience.needExp;
                let level = user.character.level;
                let time = new Date().toLocaleString();
                let awards = null;
                let up = {};
                //连胜统计
                let isRank = false;
                let isStarUp = 0;
                let isUp = false;
                if (!roomInfo.isFriend) {
                    if (result.wins > 0) {
                        winningStreak++;
                    } else {
                        winningStreak = 0;
                    }
                    up["character.winningStreak"] = winningStreak;

                    this.logger.info("用户选择的段位 :" + rankType);
                    this.logger.info("用户当前段位 :" + rank);
                    if (rankType == rank) {
                        //段位统计
                        if (result.losses) {
                            result.star = -1;
                        }
                        if (star + result.star <= 0) {
                            star = 0;
                            up["character.season." + season + ".star"] = star;
                        } else {
                            if (englishConfigs.Stage.Get(rank).star == (star + result.star)) {
                                isRank = true;
                                rank++;
                                star = 0;
                                up["character.season." + season + ".star"] = star;
                            } else {
                                star += result.star;
                                isStarUp = result.star;
                                cost["character.season." + season + ".star"] = star;
                            }
                        }


                        up["character.season." + season + ".rank"] = rank;

                        up["character.season." + season + ".createTime"] = time;

                    }


                }

                this.logger.info("等级提升 ：", exp, result.exp, needExp);
                let nextLevel = englishConfigs.Level.Get(level + 1).next;
                this.logger.info("下一个等级 :" + nextLevel);
                if (nextLevel != -1) {
                    //等级统计
                    if ((exp + result.exp) >= needExp) {
                        level++;
                        isUp = true;
                        awards = englishConfigs.Level.Get(level).award;

                        needExp = Number(englishConfigs.Level.Get(level + 1).EXP);
                        cost ["items." + awards.k] = Number(awards.v);
                        items ["items." + awards.k] = Number(awards.v);

                        cost ["character.level"] = 1;
                        up["character.experience.needExp"] = needExp;
                        up["character.experience.exp"] = 0;
                    } else {
                        cost["character.experience.exp"] = result.exp;
                    }
                }


                this.logger.info(user.nickName + "数据入库 :", cost, up);

                if(up){
                    await this.ctx.model.PublicModel.User.update({uid: user.uid, appName: appName}, {
                        $set: up,
                    });
                }
                await this.ctx.model.PublicModel.User.update({uid: user.uid, appName: appName}, {
                    $inc: cost,
                });



                let upUser = await this.ctx.model.PublicModel.User.findOne({uid: user.uid, appName: appName});
                 this.ctx.service.publicService.itemService.itemChange(upUser, items, constant.AppName.ENGLISH);

                player.setUser(upUser);

                let englishPKRecord = {
                    uid: upUser.uid,
                    season: season,
                    score: player.score,
                    continuousRight: player.continuousRight,
                    right: player.right,
                    mistake: player.mistake,
                    startTime: player.startTime,
                    waitTime: player.waitTime,
                    isInitiator: player.isInitiator,
                    isFriend: roomInfo.isFriend,
                    answers: player.answers,
                    opponent: result.challenger.user.uid,
                    opponentScore: result.challenger.score,
                    rid: rid,
                    result: result.final,
                    date:new Date().toLocaleDateString(),
                    time:new Date().toLocaleTimeString()
                };
                this.ctx.model.EnglishModel.EnglishPKRecord.create(englishPKRecord);


                let ulist = [];
                for (let uInfo of roomInfo.userList.values()) {
                    let user = {
                        info: uInfo.user,
                        score: uInfo.score,
                        continuousRight: uInfo.continuousRight,
                        winningStreak: uInfo.user.character.winningStreak
                    };
                    if (uInfo.user.uid != player.user.uid) {
                        let opponent = await this.ctx.model.PublicModel.User.findOne({uid: uInfo.user.uid, appName: appName});
                        user.winningStreak = opponent.character.winningStreak;
                    }

                    ulist.push(user);
                }



                if (player.user.uid == leaveUid) {
                    if (player.isInitiator) {
                        roomMangerLeave = true;
                    }
                    this.logger.info("离开者 ：" + player.user.nickName);
                 /*   this.ctx.service.socketService.socketioService.delSocket(appName, player.user.uid);*/
                } else {
                    this.logger.info("pkend 推送信息 " , {
                        isLeave: isLeave,
                        userList: ulist,
                        exp: result.exp,
                        gold: result.gold,
                        final: result.final,
                        isFriend: roomInfo.isFriend,
                        pkResult: {
                            isRank: {
                                isRank: isRank,
                                rank: rank
                            },
                            isStarUp: {
                                isStarUp: isStarUp,
                            },
                            isUp: {
                                isUp: isUp,
                                level: level,
                                awards: awards
                            }
                        }
                    })

                    socket.emit('pkEndSettlement', {
                        code: constant.Code.OK,
                        data: {
                            isLeave:isLeave,
                            userList: ulist,
                            exp: result.exp,
                            gold: result.gold,
                            final: result.final,
                            isFriend: roomInfo.isFriend,
                            pkResult: {
                                isRank: {
                                    isRank: isRank,
                                    rank: rank
                                },
                                isStarUp: {
                                    isStarUp: isStarUp,
                                },
                                isUp: {
                                    isUp: isUp,
                                    level: level,
                                    awards: awards
                                }
                            }
                        }
                    });
                    if (!roomInfo.isFriend || roomMangerLeave) {
                        socket.leave(rid);
                    }

                }


            }
        }

        if (!roomInfo.isFriend || roomMangerLeave) {

            this.app.roomList.get(appName).delete(rid);
            return true
        }

        return false;

    }
}


module.exports = EnglishService;