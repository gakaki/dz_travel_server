const utils = require("../../../utils/utils");
const constant = require("../../../utils/constant");
const englishConfigs = require("../../../../sheets/english");

class EnglishRoom {
    constructor(rid,difficulty=1,isFriend=false) {
        this.userList = new Map(); //参与者
        this.bystander=new Map(); //旁观者
        this.rid = rid;
        this.difficulty=difficulty;
        this.isFriend=isFriend;
        this.wordList=null;
        this.roomStatus=constant.roomStatus.ready;
        this.roundTimeOut=-1;
    }



    joinRoom(player){
        if(this.userList.size<2){
            this.userList.set([player.user.uid],player);
        }else{
            this.bystander.set([player.user.uid],player);
        }
    }



    leaveBystander(uid){
        this.bystander.delete(uid);
    }

    leaveUserList(uid){
        return this.userList.delete(uid);
    }
    setWordList(wordList){
        this.roomStatus=constant.roomStatus.isGaming;
        this.wordList=wordList;
    }

    setRoomStatus(status){
        this.roomStatus=status;
    }
    start(ctx,uid,appName,time,countDown,rid){
        let timeout = 11;
        if(countDown<5){
            timeout = 6
        }
        console.log("开始定时"+countDown);
        this.roundTimeOut = setTimeout(function () {
            console.log("可能卡死了。。");
        //    if(time<5){
                ctx.service.englishService.englishService.roundEndNotice(appName,uid,rid);
         //   }/*else{
            //   ctx.service.englishService.englishService.pkEnd(rid,appName,null);
       //     }*/

        },timeout*1000)
    }
    stop(ctx,uid,appName,time,rid,isLeave=false){
        console.log("结束定时");
        clearTimeout(this.roundTimeOut);
        this.roundTimeOut=-1;
        if(!isLeave){
          //  if(time<5){
                ctx.service.englishService.englishService.roundEndNotice(appName,uid,rid);
         //   }/*else{
             //   ctx.service.englishService.englishService.pkEnd(rid,appName,null);
        //    }*/
        }

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
                if(!isFriend){
                    if(owner.score == challenger.score){
                        result.final=1;
                    }
                    result.losses=1;
                }
            }
        }



        return result;
    }
}


module.exports = EnglishRoom;