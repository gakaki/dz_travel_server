module.exports = app => {
    const mongoose = app.mongoose;
    const TravelLogSchema = new mongoose.Schema({
        uid:{type:String},
        city:{type:String},
        rentCarType:{type:Number},
        scenicspot:{type:String},//景点名
        createDate:{type:Date} //景点具体到达时间

    });

    return mongoose.model('TravelLog', TravelLogSchema);
};

