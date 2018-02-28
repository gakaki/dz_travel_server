const Service = require('egg').Service;

const userList = {};//在线用户列表
const userCount = {};//在线用户数
const roomList = {};

module.exports = app => {
    return class SocketService extends Service {

        //添加在线用户
        async addUser(appName, udata) {
            let uList = userList[appName] ? userList[appName] : userList[appName] = {};
            uList [udata.user.uid] = udata;
            userCount[appName] ? userCount[appName]++ : userCount[appName] = 1;
        }

        getUserList(appName, uid) {
            if (userList[appName]) {
                if (uid) {
                    return userList[appName][uid];
                }
            }
            return userList[appName];
        }

        setUser(appName, udata) {
            let uList = userList[appName] ? userList[appName] : userList[appName] = {};
            uList [udata.user.uid] = udata;
        }

        delUser(appName, uid) {
            delete userList[appName][uid];
            userCount[appName]--;
        }


        getUserCount(appName) {
            if (userCount[appName]) {
                return userCount[appName];
            }
            return 0;
        }

        setRoomList(appName, roomInfo) {
            let rList = roomList[appName] ? roomList[appName] : roomList[appName] = {};
            rList[roomInfo.roomId] = roomInfo;
        }

        getRoomList(appName, roomId) {
            if (roomList[appName]) {
                if (roomId) {
                    return roomList[appName][roomId];
                }
            }
            return roomList[appName];
        }


    }
};

