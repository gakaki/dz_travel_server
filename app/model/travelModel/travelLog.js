module.exports = app => {
    const mongoose = app.mongoose;
    const TravelLogSchema = new mongoose.Schema({
        uid:{type:String},
        fid:{type:String},
        cid:{type:String},
        rentCarType:{type:Number},
        scenicspot:{type:String},//景点名称
        createDate:{type:Date} //景点具体到达时间

    });

    return mongoose.model('TravelLog', TravelLogSchema);
};

