const Service = require('egg').Service;

const userList={};
const roomList={};
const userCount={};
const socketList={};

module.exports =app =>{
    return class SocketService extends Service {

        //添加在线用户
        async addUser(appName,udata,isRegister=false) {
            let uList=userList[appName]? userList[appName] :userList[appName]={};
            uList [udata.uid] = udata;
            let registerCount = 0;
            if(isRegister){
                registerCount = 1;
            }
            let dataStr = new Date().toLocaleDateString();
            if(userCount[appName]){
                userCount[appName] ++;
                this.ctx.model.PublicModel.Statistic.update({appName:appName,date:dataStr},
                    {$inc:{loginCount:1,registerCount:registerCount}})
            }else{
                userCount[appName]=1;
                 this.ctx.model.PublicModel.Statistic.create({
                    appName:appName,
                    loginCount:1,
                    registerCount:registerCount
                });
            }

        }

        getUserList(appName,uid){
            if(userList[appName]){
                if(uid){
                    return userList[appName][uid];
                }
            }
            return userList[appName];
        }

        delUser(appName,uid){
            delete userList[appName][uid];
        }



        setSocket(uid,socket){
            socketList[uid]=socket;
        }

        getSocket(uid){
            return socketList[uid];
        }
        delSocket(uid){
            delete socketList[uid]
        }

        getUserCount(appName){
            if(userCount[appName]){
                return userCount[appName];
            }
            return 0;
        }
        setRoomList(appName,roomInfo){
            let rList=roomList[appName]? roomList[appName] :roomList[appName]={};
            rList[roomInfo.roomId]=roomInfo;
        }

        getRoomList(appName,roomId){
            if(roomList[appName]){
                if(roomId){
                    return roomList[appName][roomId];
                }
            }
            return roomList[appName];
        }



    }
};

