const Service = require('egg').Service;
const EnglishRoom = require('../../io/room/englishRoom/englishRoom');
const constant = require("../../utils/constant");
const utils = require("../../utils/utils");
const englishConfigs = require("../../../sheets/english");

class EnglishService extends Service {
    matchSuccess(matchPoolPlayer, roomId) {
        let englishroom = this.app.roomList.get(constant.AppName.ENGLISH).get(roomId);
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

                socket.emit('joinSuccess', {
                    code: constant.Code.OK,
                });

                // setTimeout(function () {
                socket.emit("matchSuccess", {
                    code: constant.Code.OK,
                    data: {
                        userList: uList,
                        roomInfo: englishroom
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


    async showPersonal(ui) {
        let date = new Date().toLocaleDateString();
        let answerRecords = await this.ctx.model.EnglishModel.EnglishAnswerRecord.find({uid: ui.uid, date: date});
        let todayWords = new Set();
        let rightCount = 0;
        let newWord = 0;
        let wordList = ui.wordList;
        let wordArr = [];
        for (let date in wordList) {
            wordArr.push(...wordList[date]);
        }
        let wordLib = new Set(wordArr);
        for (let record of answerRecords) {
            todayWords.add(record.wid);
            if (!wordLib.has(record.wid)) {
                newWord++;
            }
            if (record.isRight) {
                rightCount++;
            }
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
                totalWordCount: wordLib.size,
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


    async signin(ui, appName) {
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

        return reward;
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
        console.log("有道具 ：" + ui.items[englishConfigs.Item[upSpeech.speech.toUpperCase()]]);
        console.log("需要的 ：" + upSpeech.consume[englishConfigs.Item[upSpeech.speech.toUpperCase()]]);
        console.log("有金币 ：" + ui.items[englishConfigs.Item.GOLD]);
        console.log("需要的 ：" + upSpeech.consume[englishConfigs.Item.GOLD]);
        if ((ui.items[englishConfigs.Item.GOLD] < upSpeech.consume[englishConfigs.Item.GOLD]) || (ui.items[englishConfigs.Item[upSpeech.speech.toUpperCase()]] < upSpeech.consume[englishConfigs.Item[upSpeech.speech.toUpperCase()]])) {
            return null;
        }

        console.log(upSpeech.consume[englishConfigs.Item.GOLD]);
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
        for (let userId of userList) {
            let user = await this.ctx.model.PublicModel.User.findOne({uid: userId, appName: appName});
            let friend = {
                uid: user.uid,
                appName: appName,
                nickName: user.nickName,
                avatarUrl: user.avatarUrl,
                location: user.location,
                ELO: user.character.season[season].ELO,
                rank: user.character.season[season].rank,
                star: user.character.season[season].star,
                createTime: user.character.season[season].createTime
            };
            uList.push(friend);
        }

        let sortList = utils.multisort(uList,
            (a, b) => b["ELO"] - a["ELO"],
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
                    ELO: user.character.season[nowSeason].ELO,
                    rank: user.character.season[nowSeason].rank,
                    star: user.character.season[nowSeason].star,
                    createTime: user.character.season[nowSeason].createTime
                };
                seasonList.push(player);
            }
        }
        let sortList = utils.multisort(seasonList,
            (a, b) => b["ELO"] - a["ELO"],
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
            let word = {
                id: qword.id,
                type: types[type]
            };
            questions.push(word);
        }

        return questions;
    }


    leaveRoom(uid, rid, appName, isInitiator) {
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
                    return
                } else {
                    this.app.messenger.sendToApp('exchange', {appName: constant.AppName.ENGLISH, rid: rid});
                }

            }

        }
        //  if(!isOver){
        //直接触发游戏结束
        this.app.messenger.sendToApp('pkend', {appName: appName, rid: rid, leaveUid: uid});

        // }

     /*   if (roomList[rid].userList.size == 0) {
            this.app.messenger.sendToApp('delRoom', {appName: appName, rid: rid});
        }*/
    }

    exchange(appName, rid, uList, rInfo) {
        let roomInfo = this.app.roomList.get(appName).get(rid);
        for (let userId of roomInfo.userList.keys()) {
            let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, userId);
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
            let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, bystander);
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

    async pkEnd(rid, appName, leaveUid) {
        let isLeave = false;
        let roomInfo = this.app.roomList.get(appName).get(rid);
        for (let player of roomInfo.userList.values()) {
            let socket = this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH, player.user.uid);
            if (socket) {
                if (player.user.uid == leaveUid) {
                    this.ctx.service.socketService.socketioService.delSocket(appName, player.user.uid);
                    isLeave = true;
                }
                let result = roomInfo.gameover(player.user.uid, roomInfo.isFriend, isLeave);
                let season = this.getSeason();
                let user = player.user;
                let rankType = player.rankType;

                let cost = {
                    ["character.experience.exp"]: result.exp,
                    ["character.wins"]: result.wins,
                    ["character.losses"]: result.losses,
                    ["character.total"]: result.total,
                    ["character." + season + ".ELO"]: 200 * result.star,
                    ["items." + englishConfigs.Item.GOLD]: result.gold
                };

                let winningStreak = user.character.winningStreak;
                let rank = user.character[season].rank;
                let star = user.character[season].star;
                let exp = user.character.experience.exp;
                let needExp = user.character.experience.needExp;
                let level = user.character.level;
                let time = new Date().toLocaleString();
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

                    if (rankType == user.character[season].rank) {
                        //段位统计
                        if (star + result.star < 0) {
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

                        up["character." + season + ".rank"] = rank;
                        up["character." + season + ".star"] = star;
                        up["character." + season + ".createTime"] = time;
                    }


                }


                //等级统计
                if ((exp + result.exp) == needExp) {
                    level++;
                    isUp = true;
                    let awards = englishConfigs.Level.Get(level).award;
                    needExp = englishConfigs.Speech.Get(level);
                    for (let award of awards) {
                        cost ["items." + award] = 1;
                    }
                    cost ["character.level"] = 1;
                    up["character.experience.needExp"] = needExp;
                }


                await this.ctx.model.PublicModel.User.update({uid: user.uid, appName: appName}, {
                    $set: up,
                    $inc: cost,
                });


                let upUser = await this.ctx.model.PublicModel.User.findOne({uid: user.uid, appName: appName});
                //   console.log(ui);
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

                //app.messenger.sendToApp('setRoom',{appName:constant.AppName.ENGLISH,room:roomInfo,isOver:true});
                app.messenger.sendToApp('refresh', {appName: constant.AppName.ENGLISH, refreshPlayer: player});


                let ulist = [];
                for (let player of roomInfo.userList.values()) {
                    //  console.log(player);
                    ulist.push({
                        info: player.user,
                        score: player.score,
                        continuousRight: player.continuousRight,
                        // playerAnswer:player.answers
                    })
                }

                socket.leave(rid);

                if(!isLeave){
                    socket.emit('pkEndSettlement', {
                        code: constant.Code.OK,
                        data: {
                            userList: ulist,
                            final: result.final,
                            isFriend: roomInfo.isFriend
                        }
                    });

                    socket.emit("pkResult", {
                        code: constant.Code.OK,
                        data: {
                            isRank: isRank,
                            isStarUp: isStarUp,
                            isUp: isUp
                        }
                    })
                }

            }

        }
        if(!roomInfo.isFriend){
            this.app.messenger.sendToApp('delRoom', {appName: appName, rid: rid});
        }

    }
}


module.exports = EnglishService;