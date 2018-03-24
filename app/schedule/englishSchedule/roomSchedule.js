const constant = require("../../utils/constant");

module.exports = {
    schedule: {
        interval: '1s',
        type: 'worker', // all 指定所有的 worker 都需要执行
    },
    async task(ctx) {
        let roomPool = await ctx.app.redis.smembers("roomPool");
        for(let roomId of roomPool){
            let roomInfo = await ctx.app.redis.hgetall(roomId);
            //房间存在
            if(roomInfo.rid){
                ctx.logger.info(roomInfo);
                //游戏还在惊醒中。
                if(!Number(roomInfo.isGameOver)){
                    ctx.logger.info("游戏中");
                    let round = Number(roomInfo.round);
                    let waitTime = Number(roomInfo.waitTime);
                    let userList = JSON.parse(roomInfo.userList);
                    let uSet = new Set(userList);
                    let isRoundEnd = true;
                    if(waitTime< 25 ){
                        waitTime ++;
                        if(round == 6 ){
                            if(waitTime < 2 ){
                                //pkend,正常结束
                                ctx.logger.info("正常结束");
                                waitTime = 0;
                                round=1;
                                roomInfo.isGameOver = 1;
                                roomInfo.roomStatus = constant.roomStatus.ready;

                                for(let uid of userList) {
                                    await ctx.service.englishService.englishService.pkEnd(roomId,uid, constant.AppName.ENGLISH, null);

                                }
                                for(let id of userList){
                                    let iplayer = await ctx.app.redis.hgetall(id);
                                    if (!Number(roomInfo.isFriend)) {
                                        ctx.service.redisService.redisService.init(iplayer);
                                    }else{
                                        ctx.service.redisService.redisService.init(iplayer,1);
                                    }
                                }
                                ctx.app.redis.srem("roomPool",roomId);
                                if(!Number(roomInfo.isFriend)){
                                    await ctx.app.redis.del(roomId);
                                }
                            }
                        }else{
                            ctx.logger.info("checkanswer");
                            //checkanswer
                            for (let userId of userList) {
                                let player = await ctx.app.redis.hgetall(userId);
                                //玩家状态发生改变 ，游戏结束
                                if(!player.uid ||!Number(player.rid) || Number(player.rid) != Number(roomId)){
                                    waitTime = 0;
                                    round=1;
                                    roomInfo.isGameOver = 1;
                                    roomInfo.roomStatus = constant.roomStatus.ready;
                                  //  await ctx.service.englishService.englishService.pkEnd(roomId, constant.AppName.ENGLISH, userId);
                                    let roomMangerLeave = false;
                                    for(let uid of userList) {
                                        await ctx.service.englishService.englishService.pkEnd(roomId,uid, constant.AppName.ENGLISH, userId);
                                    }
                                    if(Number(player.isInitiator)){
                                        roomMangerLeave = true;
                                    }
                                    for(let id of userList){
                                        let lplayer = await ctx.app.redis.hgetall(id);
                                        if (!Number(roomInfo.isFriend) || roomMangerLeave) {
                                            ctx.service.redisService.redisService.init(lplayer);
                                        }else{
                                            ctx.service.redisService.redisService.init(lplayer,1);
                                        }
                                    }

                                    if(Number(roomInfo.isFriend) && !Number(player.isInitiator)){
                                        uSet.delete(userId);
                                        roomInfo.userList = JSON.stringify(Array.from(uSet));
                                    }else{
                                        await ctx.app.redis.del(roomId);

                                    }
                                    ctx.app.redis.srem("roomPool",roomId);
                                    roomInfo.round = round;
                                    roomInfo.waitTime = waitTime;
                                    await ctx.app.redis.hmset(roomId, roomInfo);
                                    break;
                                }else{
                                    let answers = JSON.parse(player.answers);
                                    ctx.logger.info(answers.length, Number(roomInfo.round));
                                    if (answers.length != round) {
                                        isRoundEnd = false;
                                        break;
                                    }
                                }
                            }
                            ctx.logger.info("是否能切题"+isRoundEnd);
                            if(isRoundEnd){
                                //nextRound
                                round ++;
                                waitTime = 0;
                                if(round<6){
                                    ctx.service.englishService.englishService.roundEndNotice(roomId,round);
                                }

                            }

                        }

                    }else{
                        ctx.logger.info("玩家无响应。自动nextRound");
                        //玩家无响应。自动nextRound
                        round ++ ;
                        waitTime = 0;
                        if(round < 6){
                            ctx.service.englishService.englishService.roundEndNotice(roomId,round);
                        }

                    }

                    roomInfo.round = round;
                    roomInfo.waitTime = waitTime;

                    await ctx.app.redis.hmset(roomId, roomInfo);







                }else{
                    if(!Number(roomInfo.isFriend)){
                        ctx.app.redis.srem("roomPool",roomId);
                    }
                }
            }else{
                ctx.app.redis.srem("roomPool",roomId);
            }

        }

    },
};