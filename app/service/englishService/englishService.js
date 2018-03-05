const Service = require('egg').Service;
const EnglishRoom = require('../../io/room/englishRoom/englishRoom');
const constant = require("../../utils/constant");
const utils = require("../../utils/utils");
const englishConfigs = require("../../../sheets/english");

class EnglishService extends Service {
    matchSuccess(matchPoolPlayer) {
        let roomId = "10" + new Date().getTime();
        let season=this.getSeason();
        let userList = [];
        let playerA=matchPoolPlayer[0];
        let playerB=matchPoolPlayer[1];
        let pARank=playerA.user.character.season[season].rank;
        let pBRank=playerB.user.character.season[season].rank;
        let pk = Math.min(pARank,pBRank);
        let difficulty = englishConfigs.Stage.Get(pk).difficulty;
        let index = utils.Rangei(0,difficulty.length);
        let englishRoom = new EnglishRoom(roomId,difficulty[index],false);
        for (let player of matchPoolPlayer) {
            this.ctx.service.publicService.matchingService.mtachFinish(player, constant.AppName.ENGLISH, roomId);
            player.socket.join(roomId);
            englishRoom.joinRoom(player);
            let user = {
                info: player.user,
                waitTime: player.waitTime,
                isInitiator:player.isInitiator
            };
            userList.push(user);
        }
        this.ctx.service.socketService.socketioService.setRoomList(constant.AppName.ENGLISH,englishRoom);

        const nsp = this.app.io.of('/english');
        nsp.to(roomId).emit('matchSuccess', {
            code:constant.Code.OK,
            data:{
                userList: userList,
                roomInfo:englishRoom
            }
        });

    }

    matchFailed(player) {
        this.ctx.service.publicService.matchingService.mtachFinish(player, constant.AppName.ENGLISH);
        player.socket.emit("matchFailed",{
            code:constant.Code.REQUIRED_LOST
        });
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
                ELO:user.character.season[season].ELO,
                rank:user.character.season[season].rank,
                star:user.character.season[season].star,
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
            if(nowSeason == 1){
                return null;
            }else{
                nowSeason -= 1;
            }

        }
        let allUser=await this.ctx.model.PublicModel.User.find({appName:appName});
        let seasonList=[];
        for(let user of allUser){
            if(allUser.character.season[nowSeason]){
                let player ={
                    uid:user.uid,
                    appName:appName,
                    nickName:user.nickName,
                    avatarUrl:user.avatarUrl,
                    ELO:user.character.season[nowSeason].ELO,
                    rank:user.character.season[nowSeason].rank,
                    star:user.character.season[nowSeason].star,
                };
                seasonList.push(player);
            }
        }
        let sortList=utils.multisort(seasonList,
            (a, b) => b["ELO"]-a["ELO"],
            (a, b) => a["createTime"]-b["createTime"]);

        return sortList.slice(0,100);
    }

    getSeason(){
        let date = new Date();
        let seasons=englishConfigs.seasons;
        for(let season of seasons){
            let time = season.periodtime.split(",");
            if(date>= new Date(time[0]) && date <= new Date(time[1])){
                return season.id
            }
        }
    }
}


module.exports = EnglishService;