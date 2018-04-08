const Service = require('egg').Service;
const uuid = require("uuid");

class DoubleService extends Service {
    async initDoubleFly(uid){
        let invitationCode = uuid.v1();
        let doubleFly ={
            code:invitationCode,
            inviter:uid,
            invitee:"0",
        };
        await this.app.redis.hmset(invitationCode,doubleFly);
        return invitationCode;
    }
}


module.exports = DoubleService;