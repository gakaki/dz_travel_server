const constant = require("../../../utils/constant");

class EnglishPlayer {
    constructor(socket, user, status, appName) {
        this.socket = socket;
        this.user = user;
        this.status = status;
        this.appName = appName;
        this.waitTime = 0;
        this.wait = null;
        this.startTime = null;
        this.score=0;
        this.answers=[];
        this.answer=null;
        this.right=0;
        this.mistake=0;
        this.continuousRight=0;
        this.isInitiator=false;
    }

    setStatus(status) {
        this.status = status;
    }

    setScore(score){
        this.score=score;
    }

    setAnswer(answer){
        this.answer=answer;
        this.answers.push(answer);
    }

    setResult(isRight){
        if(isRight){
            this.right ++;
            this.continuousRight ++;
        }else {
            this.mistake ++;
            this.continuousRight =0;
        }
    }

    setInitiator(){
        this.isInitiator=true;
    }
    setUser(userInfo){
        this.user=userInfo;
    }


    readyWait() {
        let that = this;
        this.startTime = new Date().toLocaleString();
        that.wait = setInterval(function () {
            that.waitTime++;
        }, 1000)
    }

    finishReady() {
        clearTimeout(this.wait);
        this.status = constant.playerStatus.isGaming;
    }

    gameFinish() {
        clearTimeout(this.wait);
        this.status = constant.playerStatus.online;
        this.startTime = null;
        this.waitTime = 0;
        this.score=0;
        this.answers=[];
        this.right=0;
        this.mistake=0;
        this.continuousRight=0;
        this.isInitiator=false;
    }

}


module.exports = EnglishPlayer;