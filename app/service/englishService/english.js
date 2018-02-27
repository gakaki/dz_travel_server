const Service = require('egg').Service;
const Room = require('../../io/room/room');
const constant = require("../../utils/constant");


module.exports =app =>{
    return class EnglishService extends Service {
         matchSuccess(matchPoolPlayer){
             let roomId="0"+new Date().getTime();
             let userList =[];
            for(let player of matchPoolPlayer){
                this.ctx.service.publicService.matching.mtachFinish(player,constant.AppName.ENGLISH,roomId);
                player.socket.join(roomId);
                let user={
                    info:player.user,
                    waitTime:player.waitTime,
                    roomId:player.roomId
                };
                userList.push(user);
            }
             const nsp = app.io.of('/english');
             nsp.to(roomId).emit('matchSuccess', {
                 userList:userList,
                 roomType:"english",
                 action: 'join',
                 target: 'participator',
               //  message: `User(${uid}) joined.`,
             });

        }

        matchFailed(player){
            this.ctx.service.publicService.matching.mtachFinish(player,constant.AppName.ENGLISH);
            player.socket.emit("matchFailed",this.ctx.helper.parseMsg("matchFailed",{
                info:player.user,
            }));
        }
    }
};

