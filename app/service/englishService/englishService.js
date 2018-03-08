const Service = require('egg').Service;
const EnglishRoom = require('../../io/room/englishRoom/englishRoom');
const constant = require("../../utils/constant");
const utils = require("../../utils/utils");
const englishConfigs = require("../../../sheets/english");

class EnglishService extends Service {
    matchSuccess(matchPoolPlayer,roomId) {
        let englishroom=this.app.roomList.get(constant.AppName.ENGLISH).get(roomId);
        for (let player of matchPoolPlayer) {
            let socket=this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH,player.user.uid);
            if(socket){
                socket.join(roomId);
                let uList = [];
                for(let player of englishroom.userList.values()){
                    let user = {
                        info:player.user,
                        isInitiator:player.isInitiator
                    };
                    uList.push(user);
                }

                socket.emit('joinSuccess', {
                    code:constant.Code.OK,
                });

                setTimeout(function () {
                    socket.emit("matchSuccess",{
                        code:constant.Code.OK,
                        data:{
                            userList: uList,
                            roomInfo:englishroom
                        }
                    })
                },100)
            }
        }
    }

    matchFailed(uid) {
        let socket=this.ctx.service.socketService.socketioService.getSocket(constant.AppName.ENGLISH,uid);
        if(socket){
            socket.emit("matchFailed",{
                code:constant.Code.REQUIRED_LOST
            });
        }

    }


    async showPersonal(ui){
        let date=new Date().toLocaleDateString();
        let answerRecords=await this.ctx.model.EnglishModel.EnglishAnswerRecord.find({uid:ui.uid,date:date});
        let todayWords = new Set();
        let rightCount=0;
        let newWord=0;
        let wordList = ui.wordList;
        let wordArr=[];
        for(let date in wordList){
            wordArr.push(...wordList[date]);
        }
        let wordLib = new Set(wordArr);
        for(let record of answerRecords){
            todayWords.add(record.wid);
            if(!wordLib.has(record.wid)){
                newWord ++;
            }
            if(record.isRight){
                rightCount ++;
            }
        }
       // let answerCount = await this.ctx.model.EnglishModel.EnglishAnswerRecord.count({uid:ui.uid,date:date});


        let result = {
            userInfo:ui,
            todayWords:todayWords.size,
            remember:{
                totalCount:answerRecords.length,
                rightCount:rightCount
            },
            newWord:{
                totalWordCount:wordLib.size,
                newWordCount:newWord
            }
        };

        return result;

    }

    async updatePosition(ui,appName,position){
        if(ui.location != position){
            await this.ctx.model.PublicModel.User.update({uid: ui.uid, appName: appName}, {$set: {location:position}});
        }
        return await this.ctx.model.PublicModel.User.findOne({uid: ui.uid, appName: appName})
    }


    async signin(ui,appName){
        let cost = {
            ["items.gold"]: 200,
            ["character.cumulativeDays"]:1,
            ["character.beautifulWords"]:1,
        };
        await this.ctx.model.PublicModel.SignInRecord.create({uid:ui.uid,appName:appName});
        await this.ctx.model.PublicModel.User.update({uid: ui.uid, appName: appName}, {$inc: cost});
        await this.ctx.service.publicService.itemService.itemChange(ui, cost, appName);
    }

     develop(ui){
        let developSys=ui.character.developSystem;
         let items = ui.items;
        let speechs={};
        for(let dev in developSys){
            let sp={
                level:developSys[dev].level,
                plus:developSys[dev].plus,
                nextPlus:(developSys[dev].level+1)*(englishConfigs.Speech.Get(dev).add)/100,
                canUp:false,
                levelUP:{
                    needI:developSys[dev].consume[englishConfigs.Item[developSys[dev].speech.toUpperCase()]],
                    haveI:items[englishConfigs.Item[developSys[dev].speech.toUpperCase()]],
                    needG:developSys[dev].consume[englishConfigs.Item.GOLD],
                    havaG:items[englishConfigs.Item.GOLD],
                }
            };
            if(sp.levelUP.haveI >= sp.levelUP.needI && sp.levelUP.havaG >= sp.levelUP.havaG){
                sp.canUp = true;
            }
            if(developSys[dev].level == englishConfigs.Speech.Get(dev).endlevel ){
                sp.canUp = false;
            }
            speechs[dev]=sp;
        }
        return speechs;
    }

    async speechLevelUp(ui,id,appName){
        let upSpeech=ui.character.developSystem[id];
        let speech= upSpeech.speech;
        if(upSpeech.consume[englishConfigs.Item.GOLD] < englishConfigs.Speech.Get(id).addconsume2 || upSpeech.consume[englishConfigs.Item[speech.toUpperCase()]] < englishConfigs.Speech.Get(id).addconsume1){
            return null;
        }

        let cost = {
            ["items."+englishConfigs.Item.GOLD]: (upSpeech.consume[englishConfigs.Item.GOLD]) * -1,
            ["items."+englishConfigs.Item[speech.toUpperCase()]]: (upSpeech.consume[englishConfigs.Item[speech.toUpperCase()]]) * -1,
            ["character.developSystem."+id+".level"]:1,
            ["character.developSystem."+id+".plus"]:(englishConfigs.Speech.Get(id).add)/100,
            ["character.developSystem."+id+".consume."+englishConfigs.Item[speech.toUpperCase()]]:(englishConfigs.Speech.Get(id).addconsume1),
            ["character.developSystem."+id+".consume."+englishConfigs.Item.GOLD]:(englishConfigs.Speech.Get(id).addconsume2)
        };

        let delta = {
            ["items."+englishConfigs.Item.GOLD]: (upSpeech.consume[englishConfigs.Item.GOLD]) * -1,
            ["items."+englishConfigs.Item[speech.toUpperCase()]]: (upSpeech.consume[englishConfigs.Item[speech.toUpperCase()]]) * -1,
        };
        await this.ctx.model.PublicModel.User.update({uid: ui.uid,appName:appName}, {$inc: cost});
        let user = await this.ctx.model.PublicModel.User.findOne({uid: ui.uid,appName:appName});
        await this.ctx.service.publicService.itemService.itemChange(ui, delta, constant.AppName.ENGLISH);
        let up=user.character.developSystem[id];
        let items = user.items;
        let sp={
            level:up.level,
            plus:up.plus,
            nextPlus:(up.level+1)*(englishConfigs.Speech.Get(id).add)/100,
            canUp:false,
            levelUP:{
                needI:up.consume[englishConfigs.Item[up.speech.toUpperCase()]],
                haveI:items[englishConfigs.Item[up.speech.toUpperCase()]],
                needG:up.consume[englishConfigs.Item.GOLD],
                havaG:items[englishConfigs.Item.GOLD],
            }
        };
        if(sp.levelUP.haveI >= sp.levelUP.needI && sp.levelUP.havaG >= sp.levelUP.havaG){
            sp.canUp = true;
        }
        if(up.level == englishConfigs.Speech.Get(id).endlevel ){
            sp.canUp = false;
        }
        return sp;
    }



    async getFriendRankingList(ui,appName){
        let userList=ui.character.friendsList;
        let uList=[];
        let season=this.getSeason();
        for(let userId of userList){
            let user=await this.ctx.model.PublicModel.User.findOne({uid:userId,appName:appName});
            let friend ={
                uid:user.uid,
                appName:appName,
                nickName:user.nickName,
                avatarUrl:user.avatarUrl,
                location:user.location,
                ELO:user.character.season[season].ELO,
                rank:user.character.season[season].rank,
                star:user.character.season[season].star,
                createTime:user.character.season[season].createTime
            };
            uList.push(friend);
        }

        let sortList=utils.multisort(uList,
            (a, b) => b["ELO"]-a["ELO"],
            (a, b) => a["createTime"]-b["createTime"]);

        return sortList.slice(0,151);
    }

    async getWorldRankingList(appName,season){
        let nowSeason=this.getSeason();
        if(season){
            console.log(typeof season);
            if(nowSeason == 1){
                return null;
            }else{
                nowSeason -= 1;
            }

        }

        let allUser=await this.ctx.model.PublicModel.User.find({appName:appName});
        let seasonList=[];
        for(let user of allUser){
            if(user.character.season[nowSeason]){
                let player ={
                    uid:user.uid,
                    appName:appName,
                    nickName:user.nickName,
                    avatarUrl:user.avatarUrl,
                    location:user.location,
                    ELO:user.character.season[nowSeason].ELO,
                    rank:user.character.season[nowSeason].rank,
                    star:user.character.season[nowSeason].star,
                    createTime:user.character.season[nowSeason].createTime
                };
                seasonList.push(player);
            }
        }
        let sortList=utils.multisort(seasonList,
            (a, b) => b["ELO"]-a["ELO"],
            (a, b) => a["createTime"]-b["createTime"]);

        return sortList.slice(0,101);
    }

    getSeason(){
        let date = new Date();
        let seasons=englishConfigs.seasons;
        for(let season of seasons){
            if(date>= new Date(season.star) && date <= new Date(season.end)){
                return season.id
            }
        }
    }

    setQuestions(difficulty){
        let wordLib= englishConfigs.words;
        let words=[];
        for(let word of wordLib){
            if(word.difficulty == difficulty){
                words.push(word);
            }
        }
        return this.getWord(words);
    }

    getWord(words){
        let indexs = new Set();
        while (indexs.size<5){
            let index=utils.Rangei(0,words.length);
            indexs.add(index);
        }
        let questions=[];
        for(let i of indexs){
            let qword = words[i];
            let types = qword.type;
            let type = utils.Rangei(0,types.length);
            let word={
                id:qword.id,
                type:types[type]
            };
            questions.push(word);
        }

        return questions;
    }
}


module.exports = EnglishService;