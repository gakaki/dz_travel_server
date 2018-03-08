const englishConfigs = require("../../../sheets/english");

const utils = require("../../utils/utils");

const constant =require("../../utils/constant");

module.exports = {
    schedule: {
        interval: '1s',
        type: 'worker', // all 指定所有的 worker 都需要执行
    },
    async task(ctx) {
       //  let startTime = new Date().getTime();
        //   ctx.logger.info("执行匹配开始|开始时间|"+startTime);
        let season=ctx.service.englishService.englishService.getSeason();
        //let totalPool = ctx.service.publicService.matchingService.getTotalPool("english");
        let totalPool = ctx.app.matchPool.get(constant.AppName.ENGLISH) || new Set();
        let pointMap = new Map();
       // console.log("总玩家数 ：" +totalPool.size);
        for (let player of totalPool) {
            if (player.waitTime > 30) {
                ctx.logger.warn(player.user.uid + "在匹配池中是时间超过 30 s，直接移除");
                ctx.app.messenger.sendToApp('matchFailed',{appName:constant.AppName.ENGLISH,uid:player.user.uid});
               // ctx.service.englishService.englishService.matchFailed(player);
                continue;
            }
            let set = pointMap.get(player.user.character.season[season].ELO);
            if (set) {
                set.add(player);
            } else {
                set = new Set();
                set.add(player);
                pointMap.set(player.user.character.season[season].ELO, set);
            }
        }
      //  console.log(pointMap.get(0).size);

        for (let sameRankPlayers of pointMap.values()) {
            let continueMatch = true;
            while (continueMatch) {
                //找出匹配时间最长的玩家
                let oldest = null;
                for (let playerMatchPoolInfo of sameRankPlayers) {
                    if (oldest == null) {
                        oldest = playerMatchPoolInfo;
                    } else if (playerMatchPoolInfo.waitTime < oldest.waitTime) {
                        oldest = playerMatchPoolInfo;
                    }
                }
                if (oldest == null) {
                    break;
                }

                let max = oldest.user.character.season[season].ELO;
                let min = oldest.user.character.season[season].ELO;
                let middle = oldest.user.character.season[season].ELO;
                if (oldest.waitTime > 15) {
                    max = 10000*200;
                    min = 0;
                } else if (oldest.waitTime > 10) {
                    max = oldest.user.character.season[season].ELO + 5*200;
                    min = oldest.user.character.season[season].ELO - 5*200;
                } else if (oldest.waitTime > 5) {
                    max = oldest.user.character.season[season].ELO+ 3*200;
                    min = oldest.user.character.season[season].ELO - 3*200;
                }
                let matchPoolPlayer = new Set();
                //从中位数向两边扩大范围搜索
                for (let searchRankUp = middle, searchRankDown = middle; searchRankUp <= max || searchRankDown >= min; searchRankUp++, searchRankDown--) {
                    let thisUpRankPlayers = pointMap.has(searchRankUp) ? pointMap.get(searchRankUp) : new Set();
                    let thisDownRankPlayers = pointMap.has(searchRankDown) ? pointMap.get(searchRankDown) : new Set();
                    let thisRankPlayers = new Set([...thisUpRankPlayers, ...thisDownRankPlayers]);

                    if (thisRankPlayers.size > 0) {
                        //console.log(thisRankPlayers.size);
                        if (matchPoolPlayer.size < 1) {
                            for (let player of thisRankPlayers) {
                                if (player.user.uid != oldest.user.uid && player.status == constant.playerStatus.ready) {//排除玩家本身
                                    if (matchPoolPlayer.size < 1) {
                                        matchPoolPlayer.add(player);
                                        ctx.logger.info(oldest.user.uid + "|匹配到玩家|" + player.user.uid + "|ELO|" + player.user.character.season[season].ELO);
                                        //移除
                                        sameRankPlayers.delete(player);
                                        break;
                                    }
                                }
                            }
                        }

                    }
                }

                if (matchPoolPlayer.size == 1) {
                //    ctx.logger.info(oldest.user.uid + "|匹配到玩家数量够了|提交匹配成功处理");
                    //自己也匹配池移除
                    sameRankPlayers.delete(oldest);
                    //匹配成功处理
                    matchPoolPlayer.add(oldest);
                    let uidArr=[];
                    let rankA= oldest.rankType;
                    let rankB=0;
                    for(let player of matchPoolPlayer){
                        uidArr.push(player.user.uid);
                        if(player.user.uid != oldest.user.uid){
                            rankB=player.rankType;
                        }
                    }
                    let pk = Math.min(rankA,rankB);
                    let difficulty = englishConfigs.Stage.Get(pk).difficulty;
                    let index = utils.Rangei(0,difficulty.length);
                    let wordList=ctx.service.englishService.englishService.setQuestions(difficulty[index]);
                    ctx.app.messenger.sendToApp('matchSuccess',{appName:constant.AppName.ENGLISH,matchPoolPlayer:uidArr,wordList:wordList,difficulty:difficulty[index]});
                    //ctx.service.englishService.englishService.matchSuccess(matchPoolPlayer);
                } else {
                    //本分数段等待时间最长的玩家都匹配不到，其他更不用尝试了
                    continueMatch = false;
                    ctx.logger.info(oldest.user.uid + "|匹配到玩家数量不够，取消本次匹配");
                }
            }
        }
           // let  endTime = new Date().getTime();
          //  ctx.logger.info("执行匹配结束|结束时间|"+endTime+"|耗时|"+(endTime-startTime)+"ms");
    },
};