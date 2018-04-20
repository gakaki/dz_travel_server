module.exports = app => {
    const mongoose = app.mongoose;
    const SpotTravelEventSchema = new mongoose.Schema({
        uid:{type:String},
        eid:{type:String},      //事件id
        type:{type:Number},    //事件类型 1 ，2 ， 3， 4 为了便于统计可能
        desc:{type:String},    //事件描述
        cid:{type:String},      //cityId
        fid:{type:String},      //飞行记录id
        spotId:{type:String},   //景点id
        isPhotography:{type:Boolean}, //是否拍照
        isTour:{type:Boolean}, //是否为观光
        trackedNo:{type:String},  //访问顺序
        createDate:{type:Date , default: new Date() },  //创建时间
        receivedDate:{type:Date},  //领取奖励时间
        received:{ type:Boolean , default: false },  //是否已经接收
        // isRandom:{ type:Boolean , default: false },  //是否随机事件
    });

    return mongoose.model('SpotTravelEvent', SpotTravelEventSchema);
};

