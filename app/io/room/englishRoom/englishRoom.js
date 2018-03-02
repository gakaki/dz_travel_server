const utils = require("../../../utils/utils");
const englishConfigs = require("../../../../sheets/english");

class EnglishRoom {
    constructor(rid,difficulty=1,isFriend=false) {
        this.userList = new Map(); //参与者
        this.bystander=new Map(); //旁观者
        this.rid = rid;
        this.difficulty=difficulty;
        this.isFriend=isFriend;
        this.wordList=this.setQuestions();
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

    leaveRoom(uid){
        this.userList.delete(uid);
    }

    gameover(uid,isFriend=false){
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
            total:1,
            star:0,
            gold:0,
            wins:0,
            losses:0,
            challenger:challenger
        };

        if(owner.score > challenger.score){
            result.wins=1;
            if(!isFriend){
                result.star=1;
                result.gold=10
            }

        }else{
            result.losses=1;
            if(owner.user.character.star > 0 && !isFriend){
                result.star=-1;
            }

        }

        return result;
    }
}


module.exports = EnglishRoom;