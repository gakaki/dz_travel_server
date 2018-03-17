const utils = require("../../../utils/utils");
const constant = require("../../../utils/constant");
const englishConfigs = require("../../../../sheets/english");
var tmp = -1;
class EnglishRoom {
    constructor(rid,difficulty=1,isFriend=false,ctx) {
        this.userList = new Map(); //参与者
        this.bystander = new Map(); //旁观者
        this.rid = rid;
        this.difficulty = difficulty;
        this.isFriend = isFriend;
        this.wordList = null;
        this.roomStatus = constant.roomStatus.ready;
        this.round = 1;
        this.isGameOver = false;
        this.ctx = ctx;
    }


    joinRoom(player,ctx){
        if(ctx!=null){
            ctx.logger.info("加入房间中。。。。。。。。。"+player.user.uid)
        }
        if(this.userList.size<2){
            this.userList.set(player.user.uid,player);
        }else{

            if(!this.userList.has(player.user.uid)){
                this.bystander.set(player.user.uid,player);
            }

        }
    }



    isAllAnsRev(){
        for(let player of this.userList.values()){
            if(player.answers.length != 5){
                return false
            }
        }
        return true;
    }

    setFirstTimeOut(time){
        this.ctx.logger.info("开始第一次计时");
        this.roomStatus=constant.roomStatus.isGaming;
        this.isGameOver=false;
        this.round = 1;
        this.roundTO(time)
    }

    roundTO(t){
        this.ctx.logger.info("设置倒计时 "+this.round);
        let self =this;
        if(this.round ==6){
            t = 2000
        }
        (function(j) {
            var tmp = setTimeout(function(){
                // 该轮结束了， 最多有一个人回答题目
                // 判断是否结束
                if(self.round == 6){
                    // 去结算
                    self.gameEnd();

                }else{
                    if(self.round == j){
                        self.ctx.logger.info("玩家无响应，自动切题");
                        self.nextTurn(10);
                    }
                }

            }, t)


        })(this.round);
    }

    // 收到玩家答案
    checkAnswer(time){
        this.ctx.logger.info("checkAnswer");
        let isRoundEnd =true;
        // 检查两方的答案， 判断是 游戏结束还是下一个回合，还是等待另外一方
        for(let player of this.userList.values()){
            if(player.answers.length != this.round){
                isRoundEnd = false;
            }
        }
        this.ctx.logger.info("下一题" +isRoundEnd);
        if(isRoundEnd){
            this.nextTurn(time)
        }
    }

    nextTurn(clockTime=10){
        if(this.isGameOver){
            return;
        }
        this.ctx.logger.info("nextTurn");
        // 切入下一题
        this.round++;
        //  广播 切题
        this.ctx.service.englishService.englishService.roundEndNotice(this.rid,this.round);
        // 设置 下个 timeout
        this.ctx.logger.info("设置 下个 timeout");
        clearTimeout(tmp);
        this.roundTO(clockTime*1000);
    }

    // 结算
    async gameEnd(leaveUid=null){
        this.ctx.logger.info("gameEnd");

        if(this.isGameOver){
            return;
        }

        this.isGameOver = true;
        // 发 结果给 所有人
        this.ctx.logger.info(" 发 结果给 所有人");
        await this.ctx.service.englishService.englishService.pkEnd(this.rid,constant.AppName.ENGLISH,leaveUid);


        //设 游戏结束状态
        this.ctx.logger.info(" 设 游戏结束状态");
        this.setRoomStatus(constant.roomStatus.ready);

        for(let player of this.userList.values()){
            this.ctx.logger.info(player.user.nickName +" 游戏结束 更改玩家状态。。。。");
            player.gameFinish();
        }
        if(leaveUid !=null){
           this.userList.delete(leaveUid)
        }


    }




    leaveBystander(uid){
        this.bystander.delete(uid);
    }

    leaveUserList(uid){
        return this.userList.delete(uid);
    }
    setWordList(wordList){
      //  this.roomStatus=constant.roomStatus.isGaming;
        this.wordList=wordList;
    }

    setRoomStatus(status){
        this.roomStatus=status;
    }


    gameover(uid,isFriend=false,isLeave = false,leaveUid){
        let owner= null;
        let challenger = null;
        for(let [userId,player] of this.userList.entries()){
            if(userId == uid){
                owner = player;
            }else{
                challenger = player;
            }
        }

        let result = {
            exp:Number(englishConfigs.Constant.Get(englishConfigs.Constant.EXP).value),
            total:0,
            star:0,
            gold:0,
            wins:0,
            losses:0,
            final:0,
            challenger:challenger
        };
        if(!isFriend){
            result.total=1;
        }
        if(isLeave){
            if(uid == leaveUid){
                if(!isFriend){
                    result.losses=1;
                }
            }else{
                if(!isFriend){
                    result.wins=1;
                    result.star=1;
                    result.gold=Number(englishConfigs.Stage.Get(owner.rankType).goldcoins2)
                }
                result.final=2;
            }

        }else{
            if(owner.score > challenger.score){
                if(!isFriend){
                    result.wins=1;
                    result.star=1;
                    result.gold=Number(englishConfigs.Stage.Get(owner.rankType).goldcoins2)
                }
                result.final=2;
            }else{
                if(owner.score == challenger.score){
                    result.final=1;
                }
                if(!isFriend){
                    result.losses=1;
                }


            }
        }



        return result;
    }
}


module.exports = EnglishRoom;