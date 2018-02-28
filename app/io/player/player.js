const constant = require("../../utils/constant");

class Player {
    constructor(socket, user, status, appName) {
        this.socket = socket;
        this.user = user;
        this.status = status;
        this.appName = appName;
        this.roomId = null;
        this.waitTime = 0;
        this.wait = null;
        this.startTime = null;
    }

    setStatus(status) {
        this.status = status;
    }

    getStartTime() {
        return this.startTime;
    }

    readyWait() {
        let that = this;
        this.startTime = new Date().toLocaleString();
        that.wait = setInterval(function () {
            that.waitTime++;
        }, 1000)
    }

    finishReady(roomId) {
        clearTimeout(this.wait);
        this.status = constant.playerStatus.isGaming;
        this.roomId = roomId;
    }

    gameFinish() {
        clearTimeout(this.wait);
        this.status = constant.playerStatus.online;
        this.roomId = null;
        this.startTime = null;
        this.waitTime = 0;
    }

}


module.exports = Player;