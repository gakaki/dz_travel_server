const Service = require('egg').Service;


class MsgService extends Service {
    async unreadMsgCnt(uid) {
        let count = await this.ctx.model.TravelModel.UserMsg.count({uid:uid,isRead:false});
        this.logger.info("未读消息 "+count);
        return  count
    }

    async unreadMsgs(uid,type,page,limit) {
        let query = this.ctx.model.TravelModel.UserMsg.find({uid:uid,isRead:false}).sort({date:-1}).skip((page-1)*limit).limit(limit);
        if(type && type.length >0){
            query.where({type:type})
        }
        return await query.exec();
    }

    async readMsg(msgId) {
        return await this.ctx.model.TravelModel.UserMsg.findOne({mid: msgId});
    }

}


module.exports = MsgService;