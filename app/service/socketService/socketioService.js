const Service = require('egg').Service;


const socketList =new Map();//在线用户列表

class SocketService extends Service {

    setSocket(appName,uid,socket){
        socketList.has(appName)?socketList.get(appName):socketList.set(appName,new Map());
        socketList.get(appName).set(uid,socket);
    }

    getSocket(appName,uid){
        socketList.has(appName)?socketList.get(appName):socketList.set(appName,new Map());
        if (uid) {
            return socketList.get(appName).get(uid);
        }
        return socketList.get(appName);
    }
    delSocket(appName,uid){
        socketList.has(appName)?socketList.get(appName):socketList.set(appName,new Map());
        socketList.get(appName).delete(uid);
    }


}


module.exports = SocketService;