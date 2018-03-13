const Service = require('egg').Service;
const EnglishRoom = require('../../io/room/englishRoom/englishRoom');
const constant = require("../../utils/constant");
const utils = require("../../utils/utils");
const englishConfigs = require("../../../sheets/english");

class EnglishService extends Service {
    async matchSuccess(matchPoolPlayer, roomId) {
        let englishroom = this.app.roomList.get(constant.AppName.ENGLISH).get(roomId);
        this.logger.info("发送匹配信息 ：" + roomId);
        for (let player of matchPoolPlayer) {
            let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, player.user.uid);
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

                await this.ctx.service.publicService.itemService.itemChange(player.user, cost, constant.AppName.ENGLISH);
                /* socket.emit('joinSuccess', {
                     code: constant.Code.OK,
                 });*/

                // setTimeout(function () {
                //  this.logger.info("matchSuccess ："+englishroom.rid);
                socket.emit("matchSuccess", {
                    code: constant.Code.OK,
                    data: {
                        userList: uList,
                        rid: roomId
                    }
                })
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


        let result = {
            userInfo: ui,
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
        await this.ctx.model.PublicModel.SignInRecord.create({uid: ui.uid, appName: appName});
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
            "uid": ui.uid,
            "createDate": createDate,
            "appName": appName
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
            "uid": ui.uid,
            "createDate": createDate,
            "appName": appName
        });
        let userShareRecord = {
            uid: ui.uid,
            appName: appName
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

    roomIsExist(ui, appName, rid) {
        return this.app.roomList.has(appName) ? this.app.roomList.get(appName).get(rid) : null;
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
        uList.push({
            uid: ui.uid,
            appName: appName,
            nickName: ui.nickName,
            avatarUrl: ui.avatarUrl,
            location: ui.location,
            rank: ui.character.season[season].rank,
            star: ui.character.season[season].star,
            createTime: ui.character.season[season].createTime
        });
        for (let userId of userList) {
            let user = await this.ctx.model.PublicModel.User.findOne({uid: userId, appName: appName});
            if (user.character.season[season]) {
                let friend = {
                    uid: user.uid,
                    appName: appName,
                    nickName: user.nickName,
                    avatarUrl: user.avatarUrl,
                    location: user.location,
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

        let allUser = await this.ctx.model.PublicModel.User.find({appName: appName});
        let seasonList = [];
        for (let user of allUser) {
            if (user.character.season[nowSeason]) {
                let player = {
                    uid: user.uid,
                    appName: appName,
                    nickName: user.nickName,
                    avatarUrl: user.avatarUrl,
                    location: user.location,
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
                type: types[type]
            };
            questions.push(word);
        }

        return questions;
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


    async leaveRoom(uid, rid, appName, isInitiator) {
        let roomInfo = this.app.roomList.get(appName).get(rid);
        //是否是好友房
        if (roomInfo.isFriend) {
            //是否对局中
            if (roomInfo.roomStatus == constant.roomStatus.ready) {
                if (isInitiator) {
                    //通知其他人离开
                    for (let userId of roomInfo.userList.keys()) {
                        if (userId != uid) {
                            let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, userId);
                            if (socket) {
                                socket.leave(rid);
                                socket.emit("dissolve", {
                                    code: constant.Code.OK,
                                })
                            }

                        }
                    }
                    for (let bystander of roomInfo.bystander.keys()) {
                        let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, bystander);
                        if (socket) {
                            socket.leave(rid);
                            socket.emit("dissolve", {
                                code: constant.Code.OK,
                            })
                        }
                    }
                    return true
                }
            }

        }

        //直接触发游戏结束
          return await this.pkEnd(rid,appName,uid);

    }

    notice(appName, rid) {
        let roomInfo = this.app.roomList.get(appName).get(rid);
        let uList = [];
        for (let player of roomInfo.userList.values()) {
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
        for (let userId of roomInfo.userList.keys()) {
            let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, userId[0]);
            if (socket) {
                socket.emit('roomInfo', {
                    code: constant.Code.OK,
                    data: {
                        userList: uList,
                        roomInfo: rInfo
                    }
                });
            }
        }
        for (let bystander of roomInfo.bystander.keys()) {
            let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, bystander[0]);
            if (socket) {
                socket.emit('roomInfo', {
                    code: constant.Code.OK,
                    data: {
                        userList: uList,
                        roomInfo: rInfo
                    }
                });
            }
        }
    }

    test(uid) {
        let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, uid);
        if (socket) {
            socket.emit('test', {
                code: constant.Code.OK,
                data: {
                    msg: "this is a test"
                }
            });

            return true
        }
    }

    async roundEnd(rid, appName, time, uid) {
        let socket = this.ctx.service.socketService.socketioService.getSocket(appName, uid);
        if (socket) {
            let roomInfo = this.app.roomList.get(appName).has(rid) ? this.app.roomList.get(appName).get(rid) : null;
            if (!roomInfo) {
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

    }

    async roundEndNotice(appName, uid, rid) {
        let socket = this.ctx.service.socketService.socketioService.getSocket(appName, uid);
        if (socket) {
            const nsp = this.app.io.of("/english");
            this.logger.info("准备进行下一轮 =======  ");
            nsp.to(rid).emit('nextRound', {
                code: constant.Code.OK
            });
        }

    }

    async pkEnd(rid, appName, leaveUid) {
        this.logger.info("对战结束。。。");
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
            let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, player.user.uid);
            if (socket) {
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
                        } else {
                            if (englishConfigs.Stage.Get(rank).star == (star + result.star)) {
                                isRank = true;
                                rank++;
                                star = 0;
                            } else {
                                star = star + result.star;
                                isStarUp = result.star;
                            }
                        }


                        up["character.season." + season + ".rank"] = rank;
                        up["character.season." + season + ".star"] = star;
                        up["character.season." + season + ".createTime"] = time;

                    }


                }

                this.logger.info("等级提升 ：", exp, result.exp, needExp);
                let nextLevel = englishConfigs.Level.Get(level + 1).next;
                this.logger.info("下一个等级 :" + nextLevel)
                if (nextLevel != -1) {
                    //等级统计
                    if ((exp + result.exp) >= needExp) {
                        level++;
                        isUp = true;
                        awards = englishConfigs.Level.Get(level).award;

                        needExp = Number(englishConfigs.Level.Get(level + 1).EXP);
                        for (let award of awards) {
                            cost ["items." + award] = 1;
                            items ["items." + englishConfigs.Item.GOLD] = result.gold

                        }

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
                await this.ctx.service.publicService.itemService.itemChange(upUser, items, constant.AppName.ENGLISH);

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
                        if (result.wins || result.final == 1) {
                            user.winningStreak = 0
                        } else if (result.losses) {
                            user.winningStreak = uInfo.user.character.winningStreak
                        }
                    }

                    ulist.push(user);
                }

                socket.leave(rid);

                if (player.user.uid == leaveUid) {
                    if (player.isInitiator) {
                        roomMangerLeave = true;
                    }
                    this.logger.info("离开者 ：" + player.user.nickName);
                    this.ctx.service.socketService.socketioService.delSocket(appName, player.user.uid);
                } else {
                    socket.emit('pkEndSettlement', {
                        code: constant.Code.OK,
                        data: {
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