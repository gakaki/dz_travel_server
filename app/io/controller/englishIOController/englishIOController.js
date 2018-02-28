const constant = require("../../../utils/constant");

const Controller = require('egg').Controller;
const Player = require('./../../player/player');

class EnglishIOController extends Controller {
    async ranking() {
        const {ctx, app} = this;
        const nsp = app.io.of('/english');
        const message = ctx.args[0] || {};
        const socket = ctx.socket;
        const query = socket.handshake.query;
        const {appName, _sid, userId} = query;
        const {uid} = message;
        let player = ctx.service.socketService.socketioService.getUserList(appName, userId);
        player.setStatus(constant.playerStatus.ready);
        ctx.service.socketService.socketioService.setUser(appName, player);
        ctx.service.publicService.matchingService.readyMatch(player, appName);
    }


}

module.exports = EnglishIOController;
