module.exports = app => {
    const mongoose = app.mongoose;
    const SpotTravelEventSchema = new mongoose.Schema({
        uid:{type:String},
        eid:{type:String},      //事件id
        cid:{type:String},      //cityId
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

