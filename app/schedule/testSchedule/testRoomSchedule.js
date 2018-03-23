const constant = require("../../utils/constant");

module.exports = {
    schedule: {
        interval: '1s',
        type: 'worker', // all 指定所有的 worker 都需要执行
    },
    async task(ctx) {
        let roomPool = await ctx.app.redis.smembers("testroomPool");

        for(let roomId of roomPool){
            let roomInfo = await ctx.app.redis.hgetall(roomId);
            //房间存在
            if(roomInfo.rid){
                //ctx.logger.info(roomInfo);
                //游戏还在惊醒中。
                if(!Number(roomInfo.isGameOver)){
                //    ctx.logger.info("游戏中");
                    let round = Number(roomInfo.round);
                    let waitTime = Number(roomInfo.waitTime);
                    let userList = JSON.parse(roomInfo.userList);
                    let uSet = new Set(userList);
                    let isRoundEnd = true;
                    if(waitTime< 20 ){
                        waitTime ++;
                        if(round == 6 ){
                            if(waitTime < 2 ){
                                //pkend,正常结束
                                ctx.logger.info("正常结束");
                                waitTime = 0;
                                round=1;
                                roomInfo.isGameOver = 1;
                                roomInfo.roomStatus = constant.roomStatus.ready;
                              //  await ctx.service.englishService.englishService.pkEnd(roomId, constant.AppName.ENGLISH, null);
                                await ctx.app.redis.srem("testroomPool",roomId);
                                for(let uid of userList){
                                    let player = await ctx.app.redis.hgetall(uid);
                                    player.rid = 0;
                                    await ctx.app.redis.hmset(uid,player);
                                    await ctx.model.TestModel.TestUser.update({uid:uid},{$set:{
                                            uid:uid,
                                            rid:0,
                                        }});
                                }
                                await ctx.app.redis.del(roomId);

                            }
                        }else{
                            ctx.logger.info("checkanswer");
                            //checkanswer
                            for (let userId of userList) {
                                let player = await ctx.app.redis.hgetall(userId);
                                //玩家状态发生改变 ，游戏结束

                                let answers = JSON.parse(player.answers);
                                ctx.logger.info(answers.length, Number(roomInfo.round));
                                if (answers.length != round) {
                                    isRoundEnd = false;
                                    break;
                                }

                            }
                            ctx.logger.info("是否能切题"+isRoundEnd);
                            if(isRoundEnd){
                                //nextRound
                                round ++;
                                waitTime = 0;
                                if(round<6){
                                    ctx.logger.info("假装切题了"+isRoundEnd);
                                   // ctx.service.englishService.englishService.roundEndNotice(roomId,round);
                                }

                            }

                        }

                    }else{
                        ctx.logger.info("玩家无响应。自动nextRound");
                        //玩家无响应。自动nextRound
                        round ++ ;
                        waitTime = 0;
                        if(round < 6){
                            ctx.logger.info("假装自动切题了");
                           // ctx.service.englishService.englishService.roundEndNotice(roomId,round);
                        }

                    }

                    roomInfo.round = round;
                    roomInfo.waitTime = waitTime;

                    await ctx.app.redis.hmset(roomId, roomInfo);







                }else{
                    if(!Number(roomInfo.isFriend)){
                        ctx.app.redis.srem("testroomPool",roomId);
                    }
                }
            }else{
                ctx.app.redis.srem("testroomPool",roomId);
            }

        }

    },
};