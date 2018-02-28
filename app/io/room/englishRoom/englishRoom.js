const utils = require("../../../utils/utils");

class EnglishRoom {
    constructor(roomId) {
        this.userList = new Map();
        this.bystander=new Map();
        this.roomId = roomId;
        this.wordList=[];
        this.setQuestions();
    }

    setQuestions(){
        while (this.wordList.length < 5){
            let gameType=utils.Rangei(1,5);
            let word = this.getWord();
            let question = {
                gameType :gameType,
                word :word
            };
            this.wordList.push(question);
        }

    }

    getWord(){
        return {
            "word": "hello",
            "translate": "你好",
            "soundmark": "[helˈō]"
        }
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
            result.losses=0;
            if(owner.user.character.star > 0 && !isFriend){
                result.star=-1;
            }

        }

        return result;
    }
}


module.exports = EnglishRoom;