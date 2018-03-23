const Service = require('egg').Service;
const utils = require("../../utils/utils");
const englishConfigs = require("../../../sheets/english");
const constant = require("../../utils/constant");


class RedisService extends Service {

    async init(ui,isFriend = 0) {
        let initPlayer = {
            uid: ui.uid,
            nickName: ui.nickName,
            avatarUrl: ui.avatarUrl,
            startTime: 0,
            score: 0,
            answers: JSON.stringify([]),
            answer: 0,
            right: 0,
            mistake: 0,
            continuousRight: 0,
            isInitiator: 0,
            isBystander: 0,
            rid: 0,
            rankType: 0
        };
        if(isFriend){
            if(Number(ui.rid)){
                initPlayer.rid = ui.rid
            }
            if(Number(ui.isInitiator)){
                initPlayer.isInitiator = Number(ui.isInitiator)
            }
            this.logger.info("更新状态 ");
            this.logger.info(initPlayer)
        }
       await this.app.redis.hmset(ui.uid, initPlayer);
        return initPlayer;
    }


    async initRoom(matchPoolPlayer, rid, isFriend = 0) {
        this.logger.info("初始化房间");
        let mplayers = Array.from(matchPoolPlayer);
        this.logger.info(mplayers);
        let userList = {};
        let rankA = mplayers[0].rankType;
        let pk = rankA;
        let wordList = [];
        let difficulty = 1;
        if (!isFriend) {
            let rankB = mplayers[1].rankType;
            pk = Math.min(rankA, rankB);
            this.logger.info("PK" + pk);
             difficulty = englishConfigs.Stage.Get(pk).difficulty;
            this.logger.info(difficulty);
            let index = utils.Rangei(0, difficulty.length);
            this.logger.info("index" + index);
            this.logger.info(difficulty[index]);
             wordList = this.ctx.service.englishService.englishService.setQuestions(difficulty[index]);
        }
        if (isFriend) {
            let playerA = mplayers[0];
            playerA.rid = rid;
            playerA.isInitiator = 1;
            userList[playerA.uid] = playerA;
            await this.app.redis.hmset(playerA.uid, playerA);
        } else {
            for (let play of mplayers) {
                play.rid = rid;
                userList[play.uid] =play;
            //    this.logger.info(play);
               await this.app.redis.hmset(play.uid, play);
            }
        }

        let initRoom = {
            userList: JSON.stringify(userList),
            bystander: JSON.stringify([]),
            rid: rid,
            difficulty: difficulty,
            isFriend: isFriend,
            wordList: JSON.stringify(wordList),
            roomStatus: constant.roomStatus.ready,
            round: 1,
            isGameOver: 0
        };
  //      this.logger.info(initRoom);
       await this.app.redis.hmset(rid, initRoom);
        return initRoom;
    }

}


module.exports = RedisService;