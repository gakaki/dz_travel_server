const Service = require('egg').Service;
const EnglishRoom = require('../../io/room/englishRoom/englishRoom');
const constant = require("../../utils/constant");


class EnglishService extends Service {
    matchSuccess(matchPoolPlayer) {
        let roomId = "1" + new Date().getTime();
        let englishRoom = new EnglishRoom(roomId);
        let userList = [];
        for (let player of matchPoolPlayer) {
            this.ctx.service.publicService.matchingService.mtachFinish(player, constant.AppName.ENGLISH, roomId);
            player.socket.join(roomId);
            englishRoom.joinRoom(player);
            let user = {
                info: player.user,
                waitTime: player.waitTime,
                roomId: player.roomId
            };
            userList.push(user);
        }
        this.ctx.service.socketService.socketioService.setRoomList(constant.AppName.ENGLISH,englishRoom);
        const nsp = this.app.io.of('/english');
        nsp.to(roomId).emit('matchSuccess', {
            userList: userList,
            roomType: "english",
            action: 'join',
            target: 'participator',
            //  message: `User(${uid}) joined.`,
        });

    }

    matchFailed(player) {
        this.ctx.service.publicService.matchingService.mtachFinish(player, constant.AppName.ENGLISH);
        player.socket.emit("matchFailed", this.ctx.helper.parseMsg("matchFailed", {
            info: player.user,
        }));
    }


    async showPersonal(ui){
        let date=new Date().toLocaleDateString();
        let answerCount = await this.ctx.model.EnglishModel.EnglishAnswerRecord.count({uid:ui.uid,date:date});
        let result = {
            userInfo:ui,
            todayAnserCount:answerCount
        };

        return result;

    }
    async signin(ui,appName){
        let cost = {
            ["items.gold"]: 200,
            ["character.cumulativeDays"]:1,
        };
        await this.ctx.model.PublicModel.SignInRecord.create({uid:ui.uid,appName:appName});
        await this.ctx.model.PublicModel.User.update({uid: uid, appName: appName}, {$inc: cost,$set:{["character.beautifulWords"]:"to see world"}});
        await this.ctx.service.publicService.itemService.itemChange(ui, cost, appName);
    }
}


module.exports = EnglishService;