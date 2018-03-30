module.exports = app => {
    const mongoose = app.mongoose;
    const TravelLogSchema = new mongoose.Schema({
        uid:{type:String},
        date:{type:String},//年月日
        city:{type:String},
        rentCarType:{type:Number},
        scenicspot:{type:String},
        createDate:{type:Date} //景点具体到达时间

    });

    return mongoose.model('TravelLog', TravelLogSchema);
};

