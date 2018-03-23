const Service = require('egg').Service;
const constant = require("../../utils/constant");
const utils = require("../../utils/utils");
const englishConfigs = require("../../../sheets/english");

class EnglishService extends Service {
    async matchSuccess(matchPoolPlayer) {
        this.logger.info("匹配成功");
        this.logger.info(matchPoolPlayer);
        //创建房间
        let rid = "10" + new Date().getTime();
        let englishroom = await this.ctx.service.redisService.redisService.initRoom(matchPoolPlayer, rid);
        //通知用户
        this.logger.info("我拿到的房间信息");
        this.logger.info(englishroom);
        for (let player of matchPoolPlayer) {
           await this.app.redis.srem("matchpool", player.uid);
            this.logger.info("准备推送消息");
            let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, player.uid);
            this.logger.info("是否获取到socket" + socket);
            if (socket) {
                socket.join(rid);
                this.logger.info(player.nickName + "当前选择 为：" + player.rankType + "花费金币 L:" + englishConfigs.Stage.Get(player.rankType).goldcoins1);
                let cost = {
                    ["items." + englishConfigs.Item.GOLD]: (englishConfigs.Stage.Get(player.rankType).goldcoins1) * -1,
                };
                //扣款
                await this.ctx.model.PublicModel.User.update({
                    uid: player.uid,
                    appName: constant.AppName.ENGLISH
                }, {$inc: cost});

                let ui = await this.ctx.model.PublicModel.User.findOne({
                    uid: player.uid,
                    appName: constant.AppName.ENGLISH
                });

                this.ctx.service.publicService.itemService.itemChange(ui, cost, constant.AppName.ENGLISH);

                this.logger.info(player.nickName + "推送消息");

                socket.emit("matchSuccess", {
                    code: constant.Code.OK,
                    data: {
                        rid: rid
                    }
                });


            }
        }


        await this.app.redis.sadd("roomPool",rid);
        // this.logger.info("开启定时器")
        // //设置第一次定时器
        // let firstWord = JSON.parse(englishroom.wordList)[0];
        // let settime = 27000;
        // if (firstWord && firstWord.type == 3) {
        //     settime = 30000;
        // }
        // this.ctx.service.englishService.roomService.setFirstTimeOut(englishroom.rid, settime);


    }

    matchFailed(uid, isCancel, isGiveUp = false) {
        let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, uid);
        if (socket) {
            this.logger.info("有人退出了。。。");
            socket.emit("matchFailed", {
                code: constant.Code.OK,
                data: {
                    isCancel: isCancel,
                    isGiveUp: isGiveUp
                }
            })
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
        let totalWord = [];
        for (let date in wordList) {
            totalWord.push(...wordList[date]);
            if (date != new Date().toLocaleDateString()) {
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
        if (!landingessay) {
            landingessay = 1
        }
        this.logger.info("当日美句 " + landingessay);
        let beautifulWord = {
            english: englishConfigs.Landingessay.Get(landingessay).English,
            chinese: englishConfigs.Landingessay.Get(landingessay).Chinese
        };


        let result = {
            userInfo: ui,
            beautifulWord: beautifulWord,
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

        let reward = englishConfigs.Landing.Get(day).itemid;
        let itemChange = {};
        for (let item of reward) {
            cost["items." + item.k] = Number(item.v);
            itemChange["items." + item.k] = Number(item.v);
        }
        await this.ctx.model.PublicModel.SignInRecord.create({
            uid: ui.uid,
            appName: appName,
            createDate: new Date().toLocaleDateString(),
            createTime: new Date().toLocaleTimeString()
        });
        await this.ctx.model.PublicModel.User.update({uid: ui.uid, appName: appName}, {$inc: cost});
        let user = await this.ctx.model.PublicModel.User.findOne({uid: ui.uid, appName: appName});
        await this.ctx.service.publicService.itemService.itemChange(user, itemChange, appName);

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
            createDate: new Date().toLocaleDateString(),
        };
        let season = this.getSeason();
        if (count < englishConfigs.Constant.Get(englishConfigs.Constant.SHARENUM).value) {
            let delta = {
                ["items." + englishConfigs.Item.GOLD]: englishConfigs.Stage.Get(ui.character.season[season].rank).goldcoins1,
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

    async isInRoom(ui, appName, rankType) {
        let needGold = false;
        let inRoom = false;
        let cost = englishConfigs.Stage.Get(rankType).goldcoins1;
        if (ui.items[englishConfigs.Item.GOLD] < cost) {
            needGold = true;
        }
        let player = await this.app.redis.hgetall(ui.uid);
        if (!player) {
            player = await  this.ctx.service.redisService.redisService.init(ui);
        }
        let roomId = player.rid;
        if (Number(roomId)) {
            let roomInfo = await this.app.redis.hgetall(roomId);
            if(!roomInfo.rid){
                 inRoom = false;
            }else{
                if (Number(roomInfo.isFriend)) {
                    inRoom = true;
                }else if(!Number(roomInfo.isFriend)){
                    await this.ctx.service.englishService.roomService.leaveRoom(roomId,ui);
                }
            }

        }

        return {
            needGold: needGold,
            inRoom: inRoom
        }
    }

    async checkRoom(ui, appName, rid) {
        let roomExist = true;
        let inRoom = false;
        let isFriend = false;
        let roomInfo = await this.app.redis.hgetall(rid);
        let player = await this.app.redis.hgetall(ui.uid);
        if (!roomInfo) {
            roomExist = false;
        } else {
          //  this.logger.info("checkRoom 检查房间时 " + JSON.stringify(roomInfo));
            if (Number(roomInfo.isFriend)) {
                isFriend = true;
            }
            if (player && Number(player.rid)) {
                inRoom = true;
            }
        }

        return {
            rid: rid,
            roomExist: roomExist,
            inRoom: inRoom,
            isFriend: isFriend
        }
    }


    async roomIsExist(ui, appName, rid) {
        let roomInfo = await this.app.redis.hgetall(rid);
        if (!roomInfo.rid) {
            return null;
        } else {
            let userList = JSON.parse(roomInfo.userList);
            if (userList.length == 2) {
                return null;
            } else {
                let player ={
                    uid: ui.uid,
                    nickName: ui.nickName,
                    avatarUrl: ui.avatarUrl,
                    rid:rid,
                    isInitiator:0
                };
                let initplayer = await this.ctx.service.redisService.redisService.init(player,1);
                userList.push(ui.uid);
                roomInfo.userList = JSON.stringify(userList);
                await this.app.redis.hmset(rid, roomInfo);


                this.logger.info(initplayer);
                this.ctx.model.PublicModel.User.update({
                    uid: ui.uid,
                    appName: constant.AppName.ENGLISH
                }, {$addToSet: {["character.friendsList"]: userList[0]}});
                this.ctx.model.PublicModel.User.update({
                    uid: userList[0],
                    appName: constant.AppName.ENGLISH
                }, {$addToSet: {["character.friendsList"]: ui.uid}});
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
        let user = await this.ctx.model.PublicModel.User.findOne({uid: ui.uid, appName: appName});
        await this.ctx.service.publicService.itemService.itemChange(user, cost, constant.AppName.ENGLISH);
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
        if ((ui.items[englishConfigs.Item.GOLD] <= 0 || (ui.items[englishConfigs.Item[upSpeech.speech.toUpperCase()]] <= 0))) {
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
        let upRes = await this.ctx.model.PublicModel.User.update({
            uid: ui.uid,
            appName: appName,
            ["items." + englishConfigs.Item.GOLD]: {$gt: 0},
            ["items." + englishConfigs.Item[speech.toUpperCase()]]: {$gt: 0}
        }, {$inc: cost});
        let user = ui;
        if (upRes.n) {
            user = await this.ctx.model.PublicModel.User.findOne({uid: ui.uid, appName: appName});
            await this.ctx.service.publicService.itemService.itemChange(ui, delta, constant.AppName.ENGLISH);
        }

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
        let lastseason = season - 1;
        if (ui.character.season[lastseason]) {
            lastRank = ui.character.season[lastseason].rank;
        }
        uList.push({
            uid: ui.uid,
            appName: appName,
            nickName: ui.nickName,
            avatarUrl: ui.avatarUrl,
            city: ui.city,
            lastRank: lastRank,
            rank: ui.character.season[season].rank,
            star: ui.character.season[season].star,
            createTime: ui.character.season[season].createTime
        });
        for (let userId of userList) {
            let user = await this.ctx.model.PublicModel.User.findOne({uid: userId, appName: appName});
            if (user) {
                if (user.character.season[season]) {
                    if (user.character.season[lastseason]) {
                        lastRank = user.character.season[lastseason].rank;
                    }
                    let friend = {
                        uid: user.uid,
                        appName: appName,
                        nickName: user.nickName,
                        avatarUrl: user.avatarUrl,
                        city: user.city,
                        lastRank: lastRank,
                        rank: user.character.season[season].rank,
                        star: user.character.season[season].star,
                        createTime: user.character.season[season].createTime
                    };
                    uList.push(friend);
                }
            }

        }

        let sortList = utils.multisort(uList,
            (a, b) => b["rank"] - a["rank"],
            (a, b) => b["star"] - a["star"],
            (a, b) => a["createTime"] - b["createTime"]);

        return sortList.slice(0, 150);
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
        let lastseason = season - 1;

        let allUser = await this.ctx.model.PublicModel.User.find({appName: appName});
        let seasonList = [];
        for (let user of allUser) {
            if (user.character.season[nowSeason]) {
                if (user.character.season[lastseason]) {
                    lastRank = user.character.season[lastseason].rank;
                }
                let player = {
                    uid: user.uid,
                    appName: appName,
                    nickName: user.nickName,
                    avatarUrl: user.avatarUrl,
                    city: user.city,
                    lastRank: lastRank,
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

        return sortList.slice(0, 100);
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
         //   this.logger.info("随机数" + index)
            indexs.add(index);
        }
        let questions = [];
        for (let i of indexs) {
            let qword = words[i];
           // let qword = words[338];
            let types = qword.type;
            let type = utils.Rangei(0, types.length);
          //  let type = 2;

            let word = {
                id: qword.id,
                english: qword.english,
                chinese: qword.China,
                symbol: qword.symbol,
                speech: qword.speech,
                type: types[type],
                eliminateNum: qword.eliminateNum,
                eliminate: qword.eliminate,
            };
            // this.logger.info(word);
            if (word.type == 1 || word.type == 2) {
                word.errorWords = this.getErrorAnswer(i, words)
            }
            // this.logger.info(word);
            questions.push(word);
        }

        return questions;
    }

    getErrorAnswer(wid, wordLib) {
        // let wordLib = englishConfigs.words;
        // let errorWords = [];
        let words = new Set();
        let indexs = new Set();
        let max = wordLib.length;
        let min = 0;
        for(let i=wid+1 ;i<max ; i++){
            if(indexs.size<4){
                indexs.add(i);
            }else{
                break
            }
        }
        for(let i=wid-1 ;i>min ; i--){
            if(indexs.size<4){
                indexs.add(i);
            }else{
                break
            }
        }

      //  this.logger.info("错误答案");
    //    this.logger.info(indexs);
        for (let i of indexs) {
          //  console.log(i);
          //  this.logger.info(wordLib[i]);
            let word = {
                id: wordLib[i].id,
                english: wordLib[i].english,
                chinese: wordLib[i].China,
            };
            words.add(word);
        }

        return Array.from(words).sort(Math.random() - 0.5).slice(0, 3);
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


    async notice(rid) {
        let roomInfo = await this.app.redis.hgetall(rid);
        let season =this.ctx.service.englishService.englishService.getSeason();
        let lastRank = 0;
        let uList = [];
        let bystander = JSON.parse(roomInfo.bystander);
        let bSet = new Set(bystander);
        let userList = JSON.parse(roomInfo.userList);
        for (let uid of userList) {
            let player = await this.app.redis.hgetall(uid);
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
                isBystander: Number(player.isBystander),
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

        this.logger.info("消息通知。。。");
        this.logger.info("用户信息 ：", uList);
        this.logger.info("房间信息  ：", rInfo);

        let nsp = this.app.io.of("/english");
        nsp.to(rid).emit('room', {
            code: constant.Code.OK,
            data: {
                userList: uList,
                roomInfo: rInfo
            }
        });

    }


    async roundEndNotice(rid, time) {
        const nsp = this.app.io.of("/english");
        this.logger.info("准备进行下一轮 =======  ");
        nsp.to(rid).emit('nextRound', {
            code: constant.Code.OK,
            data: {
                round: time
            }

        });


    }

    async pkEnd(rid,userId, appName, leaveUid) {
        this.logger.info("对战结束。。。");
        this.logger.info("有离开者吗？？" + leaveUid);
        let isLeave = false;
        if (leaveUid != null) {
            isLeave = true;
        }
        let roomMangerLeave = false;
        let roomInfo = await this.app.redis.hgetall(rid);
        if (!roomInfo.rid) {
            return
        }
        let userList = JSON.parse(roomInfo.userList);
     //   for (let userId of userList) {
            let player = await this.app.redis.hgetall(userId);
            this.logger.info("不循环？？？" + player.nickName);
            let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, player.uid);
            if (socket) {

                let result = await this.ctx.service.englishService.roomService.gameover(rid, player.uid, Number(roomInfo.isFriend), isLeave, leaveUid);
                let season = this.getSeason();
                let user = await this.ctx.model.PublicModel.User.findOne({uid: userId, appName: appName});
                let rankType = player.rankType;
                this.logger.info(user.nickName+"结算。。");
              //    this.logger.info(player.nickName +"本轮成绩 ：" ,result);
                let items = {
                    ["items." + englishConfigs.Item.GOLD]: result.gold
                };
                let cost = {
                    ["character.wins"]: result.wins,
                    ["character.losses"]: result.losses,
                    ["character.total"]: result.total,
                    ["items." + englishConfigs.Item.GOLD]:  result.gold
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
                if (!Number(roomInfo.isFriend)) {
                    if (result.wins > 0) {
                        winningStreak++;
                    } else {
                        winningStreak = 0;
                    }
                    up["character.winningStreak"] = winningStreak;
                    this.logger.info("用户当前星星 :" + star);
                    this.logger.info("用户选择的段位 :" + rankType);
                    this.logger.info("用户当前段位 :" + rank);
                    if (rankType == rank) {
                        //段位统计
                        let changeStar = 0;
                        if (result.final == 0) {
                            changeStar = -1;
                        }
                        if (result.final == 2) {
                            changeStar = 1;
                        }
                        this.logger.info("用户结算星星 :" + changeStar);

                        if (star + changeStar <= 0) {
                            star = 0;
                            up["character.season." + season + ".star"] = star;
                        } else {
                            if (englishConfigs.Stage.Get(rank).star != -1 && englishConfigs.Stage.Get(rank).star <= (star + changeStar)) {
                                isRank = true;
                                rank++;
                                star = 0;
                                up["character.season." + season + ".star"] = star;
                            } else {
                                isStarUp = changeStar;
                                cost["character.season." + season + ".star"] = changeStar;
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

                if (up) {
                    await this.ctx.model.PublicModel.User.update({uid: user.uid, appName: appName}, {
                        $set: up,
                    });
                }
                await this.ctx.model.PublicModel.User.update({uid: user.uid, appName: appName}, {
                    $inc: cost,
                });


                let upUser = await this.ctx.model.PublicModel.User.findOne({uid: user.uid, appName: appName});
                this.ctx.service.publicService.itemService.itemChange(upUser, items, constant.AppName.ENGLISH);


                let englishPKRecord = {
                    uid: upUser.uid,
                    season: season,
                    score: Number(player.score),
                    continuousRight: Number(player.continuousRight),
                    right: Number(player.right),
                    mistake: Number(player.mistake),
                    startTime: Number(player.startTime),
                    isInitiator: Number(player.isInitiator),
                    isFriend: roomInfo.isFriend,
                    answers: JSON.parse(player.answers),
                    opponent: result.challenger.uid,
                    opponentScore: Number(result.challenger.score),
                    rid: rid,
                    result: result.final,
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString()
                };
                this.ctx.model.EnglishModel.EnglishPKRecord.create(englishPKRecord);


               // season = 2;
                let lastRank = 0;
                let ulist = [];

                for (let uid of userList) {
                    let  uInfo =await this.app.redis.hgetall(uid);
                    let ui = await this.ctx.model.PublicModel.User.findOne({uid: uid, appName: appName});
                    let lastSeason = ui.character.season[season - 1];
                    if (lastSeason) {
                        lastRank = lastSeason.rank;
                    }
                    let user = {
                        uid: uInfo.uid,
                        nickName: uInfo.nickName,
                        avatarUrl: uInfo.avatarUrl,
                        score: Number(uInfo.score),
                        continuousRight: uInfo.continuousRight,
                        winningStreak: ui.character.winningStreak,
                        lastRank: lastRank
                    };

                    ulist.push(user);
                }


                if (player.uid == leaveUid) {
                    if (Number(player.isInitiator)) {
                        roomMangerLeave = true;
                    }
                    this.logger.info("离开者 ：" + player.nickName);
                    /*   this.ctx.service.socketService.socketioService.delSocket(appName, player.user.uid);*/
                } else {
                    this.logger.info("發送數據 ： ");
                    this.logger.info(userList);
                    socket.emit('pkEndSettlement', {
                        code: constant.Code.OK,
                        data: {
                            isLeave: isLeave,
                            userList: ulist,
                            exp: result.exp,
                            gold: result.gold,
                            final: result.final,
                            isFriend: Number(roomInfo.isFriend),
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

                }
                if (!Number(roomInfo.isFriend) || roomMangerLeave) {
                    socket.leave(rid);
                    //this.ctx.service.redisService.redisService.init(player);
                }


      //      }
        }





        return false;

    }
}


module.exports = EnglishService;
