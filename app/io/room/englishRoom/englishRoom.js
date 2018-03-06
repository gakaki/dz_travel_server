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
    }

    setQuestions(){
        let wordLib= englishConfigs.words;
        let words=[];
        for(let word of wordLib){
            if(word.difficulty == this.difficulty){
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

    /*leaveRoom(uid){
        if(this.userList.has(uid)){
            this.userList.delete(uid);
        }
        if(this.bystander.has(uid)){
            this.bystander.delete(uid);
        }
        this.roomStatus=constant.roomStatus.ready;
    }*/

    startGame(){
        this.wordList=this.setQuestions();
        this.roomStatus=constant.roomStatus.isGaming;
    }


    gameover(uid,isFriend=false){
        if(isFriend){
            this.roomStatus=constant.roomStatus.ready;
        }
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
            exp:10,
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

        if(owner.score > challenger.score){
            if(!isFriend){
                result.wins=1;
                result.star=1;
                result.gold=englishConfigs.Stage.Get(owner.rankType).goldcoins2
            }
            result.final=2;
        }else{
            if(!isFriend){
                if(owner.score == challenger.score){
                    result.final=1;
                }
                result.losses=1;
                if(owner.user.character.star > 0){
                    result.star=-1;
                }
            }
        }

        return result;
    }
}


module.exports = EnglishRoom;