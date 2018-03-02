const Service = require('egg').Service;

const userList = new Map();//在线用户列表
//const userCount = new Map();//在线用户数
const roomList = new Map();//房间信息

class SocketService extends Service {

    //添加在线用户
     setOnlineUser(appName, udata) {
       userList.has(appName) ? userList.get(appName) : userList.set(appName,new Map());
       userList.get(appName).set(udata.user.uid ,udata);
    }

    getUserList(appName, uid) {
        if (uid) {
            return userList.get(appName).get(uid);
        }
        return userList.get(appName);
    }

    delUser(appName, uid) {
        userList.get(appName).delete(uid);
    }

    getUserCount(appName) {
        return userList.get(appName).size;
    }

    setRoomList(appName, roomInfo) {
        roomList.has(appName) ? roomList.get(appName) : roomList.set(appName,new Map());
        roomList.get(appName).set(roomInfo.rid ,roomInfo);
    }

    getRoomList(appName, roomId) {
         if (roomId) {
             return roomList.get(appName).get(roomId);
         }
        return roomList.get(appName);
    }

    delRoom(appName, roomId){
        roomList.get(appName).delete(roomId);
    }


}


module.exports = SocketService;