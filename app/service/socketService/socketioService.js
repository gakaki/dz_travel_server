/*const constant = require("../../utils/constant");*/

const Service = require('egg').Service;

let app=null;
const userList =new Map();//在线用户列表
const socketList =new Map();//在线用户列表
//const userCount = new Map();//在线用户数
const roomList = new Map();//房间信息
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

    //添加在线用户
      setOnlineUser(appName, udata) {
         // console.log(this.app.pool);
        //  this.app.pool = this.app.pool || new Map();
        //  console.log(this.app.pool.has(appName));
       //   console.log(this.app.pool);
      //    if(!this.app.pool.has(appName)){

      //        this.app.pool.set(appName,new Map());
        //  }
      /*   if(app == null){
             console.log("1");
             app=appName;
         }*/
          /*console.log(constant.userList.has(appName));*/
        // this.app.pool.get(appName).set(udata.user.uid,udata);
          userList.has(appName)?userList.get(appName):userList.set(appName,new Map());
          userList.get(appName).set(udata.user.uid,udata);

         //constant.userList.has(appName) ? constant.userList.get(appName) : constant.userList.set(appName,new Map());
        // constant.userList.get(appName).set(udata.user.uid ,udata);
    }

    getUserList(appName, uid) {
        if (uid) {
            return userList.get(appName).get(uid);
        }
        return userList.get(appName);
    }

    delUser(appName, uid) {
        console.log("????");
        userList.get(appName).delete(uid);
    }

    getUserCount(appName) {
        return   userList.get(appName)
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