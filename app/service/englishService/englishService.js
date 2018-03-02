const Service = require('egg').Service;
const EnglishRoom = require('../../io/room/englishRoom/englishRoom');
const constant = require("../../utils/constant");
const utils = require("../../utils/utils");

class EnglishService extends Service {
    matchSuccess(matchPoolPlayer) {
        let roomId = "1" + new Date().getTime();
        let englishRoom = new EnglishRoom(roomId);
        let userList = [];
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
        player.socket.emit("matchFailed", this.ctx.helper.parseMsg("matchFailed", {
            info: player.user,
        }));
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
    async signin(ui,appName){
        let cost = {
            ["items.gold"]: 200,
            ["character.cumulativeDays"]:1,
        };
        await this.ctx.model.PublicModel.SignInRecord.create({uid:ui.uid,appName:appName});
        await this.ctx.model.PublicModel.User.update({uid: uid, appName: appName}, {$inc: cost,$set:{["character.beautifulWords"]:"to see world"}});
        await this.ctx.service.publicService.itemService.itemChange(ui, cost, appName);
    }

     develop(ui){
        let developSys=ui.developSystem;
        let items = ui.items;
        let speechs={};
        for(let dev in developSys){
            let sp={
                level:developSys[dev].level,
                plus:developSys[dev].plus,
                canUp:false,
                levelUP:{
                    needI:developSys[dev].consume[developSys[dev].speech],
                    haveI:items[developSys[dev].speech],
                    needG:developSys[dev].gold,
                    havaG:items.gold,
                }
            };
            if(sp.levelUP.haveI >= sp.levelUP.needI && sp.levelUP.havaG >= sp.levelUP.havaG){
                sp.canUp = true;
            }
            speechs[dev]=sp;
        }
        return speechs;
    }

    async speechLevelUp(ui,id){
        let upSpeech=ui.developSystem[id];
    }



    async getFriendRankingList(ui,appName){
        let userList=ui.userList;
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
            (a, b) => a.uid-b.uid);

        return sortList.slice(0,151);
    }

    async getWorldRankingList(appName,season){
        let allUser=await this.ctx.model.PublicModel.User.find({appName:appName});
        let seasonList=[];
        for(let user of allUser){
            if(allUser.character.season[season]){
                let player ={
                    uid:user.uid,
                    appName:appName,
                    nickName:user.nickName,
                    avatarUrl:user.avatarUrl,
                    ELO:user.character.season[season].ELO,
                    rank:user.character.season[season].rank,
                    star:user.character.season[season].star,
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
        let date = new Date().toLocaleString();
        let seasons=[];
        for(let season of seasons){
            if(date>season.time[0] && date<season.time[1]){
                return season.id
            }
        }
    }
}


module.exports = EnglishService;