const englishConfigs = require("../../../sheets/english");
const utils = require("../../utils/utils");
const constant = require("../../utils/constant");

module.exports = {
    schedule: {
        interval: '1s',
        type: 'worker', // all 指定所有的 worker 都需要执行
    },
    async task(ctx) {
        //  let startTime = new Date().getTime();
        //   ctx.logger.info("执行匹配开始|开始时间|"+startTime);
        //  let season=ctx.service.englishService.englishService.getSeason();
        //  let totalPool = ctx.app.matchPool.get(constant.AppName.ENGLISH) || new Set();
        let totalPool = await ctx.app.redis.smembers("matchpool");
        let pointMap = new Map();
        // console.log("总玩家数 ：" +totalPool.size);
        for (let userId of totalPool) {
            let player = await ctx.app.redis.hgetall(userId);
            if (Number(player.startTime) + 30 * 1000 < new Date().getTime()) {
                ctx.logger.warn(player.uid + "在匹配池中是时间超过 30 s，直接移除");
                //    ctx.app.messenger.sendToApp('matchFailed',{appName:constant.AppName.ENGLISH,uid:player.user.uid,isCancel:false});
                await ctx.app.redis.srem("matchpool", player.uid);
                ctx.service.englishService.englishService.matchFailed(player.uid, false);
                continue;
            }
            let set = pointMap.get(player.rankType);
            if (set) {
                set.add(player);
            } else {
                set = new Set();
                set.add(player);
                pointMap.set(player.rankType, set);
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
                    }
                    /*else if (playerMatchPoolInfo.startTime < oldest.startTime) {
                                           oldest = playerMatchPoolInfo;
                                       }*/
                }
                if (oldest == null) {
                    break;
                }
                let matchPoolPlayer = new Set();
                let middle = oldest.rankType;
                let thisRankPlayers = pointMap.has(middle) ? pointMap.get(middle) : new Set();


                if (thisRankPlayers.size > 0) {
                    //console.log(thisRankPlayers.size);
                    if (matchPoolPlayer.size < 1) {
                        for (let player of thisRankPlayers) {
                            if (player.uid != oldest.uid) {//排除玩家本身
                                if (matchPoolPlayer.size < 1) {
                                    //确认是否还在线
                                    let targetA = await ctx.app.redis.hgetall(player.uid);
                                    let targetB = await ctx.app.redis.hgetall(oldest.uid);
                                    if(!targetA || !targetB){
                                        sameRankPlayers.delete(player);
                                        sameRankPlayers.delete(oldest);
                                        continue
                                    }
                                    matchPoolPlayer.add(player);
                                    ctx.logger.info(oldest.uid + "|匹配到玩家|" + player.uid + "|rankType|" + player.rankType);
                                    //移除
                                    sameRankPlayers.delete(player);
                                    break;
                                }
                            }
                        }
                    }

                }


                /*   let max = oldest.rankType;
                   let min = oldest.rankType;




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
                                           ctx.logger.info(oldest.user.uid + "|匹配到玩家|" + player.user.uid + "|rankType|" + player.rankType);
                                           //移除
                                           sameRankPlayers.delete(player);
                                           break;
                                       }
                                   }
                               }
                           }

                       }
                   }
   */
                if (matchPoolPlayer.size == 1) {
                    //    ctx.logger.info(oldest.user.uid + "|匹配到玩家数量够了|提交匹配成功处理");
                    //自己也匹配池移除
                    sameRankPlayers.delete(oldest);
                    //匹配成功处理
                    matchPoolPlayer.add(oldest);
                    ctx.service.englishService.englishService.matchSuccess(matchPoolPlayer);
                } else {
                    //本分数段等待时间最长的玩家都匹配不到，其他更不用尝试了
                    continueMatch = false;
                    //  ctx.logger.info(oldest.user.uid + "|匹配到玩家数量不够，取消本次匹配");
                }
            }
        }
        // let  endTime = new Date().getTime();
        //  ctx.logger.info("执行匹配结束|结束时间|"+endTime+"|耗时|"+(endTime-startTime)+"ms");
    },
};