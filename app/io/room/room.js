class Room{
    constructor(roomId){
        this.userList={};
        this.roomId=roomId;
    }
    setSocketList(socket,uid){
        this.userList[uid]=socket;
    }

    getSocket(uid){
        return this.userList[uid];
    }
}


module.exports=Room;