const Service = require('egg').Service;

module.exports = app => {
    return class MsgService extends Service {
        async unreadMsgCnt(uid) {
            return 1;
        }

        async unreadMsgs(uid) {
            return [{title:'test',content:'test msg'}]
        }

        async readMsg(msgId) {
            
        }
    }
}