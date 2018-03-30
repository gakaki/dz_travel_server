const Service = require('egg').Service;


class MsgService extends Service {
    async unreadMsgCnt(uid) {
        return  await this.ctx.model.TravelModel.UserMsg.count({uid:uid,isRead:false});
    }

    async unreadMsgs(uid,type,page,limit) {
        let query = this.ctx.model.TravelModel.UserMsg.find({uid:uid,isRead:false}).sort({date:-1}).skip((page-1)*limit).limit(limit);
        if(type && type.length >0){
            query.where({type:type})
        }
        return await query.exec();
    }

    async readMsg(msgId) {

    }
}


module.exports = MsgService;