module.exports = app => {
    const mongoose = app.mongoose;

    //用户景点记录表 这个可以用来作为用户的 景点游玩记录表 景点足迹表
    const SpotTimingSchema = new mongoose.Schema({
        uid:{type:String},          //用户id
        cid:{type:String},          //城市id
        spotId:{type:String},       //景点id
        createDate:{type:Date}      //创建时间
    });

    return mongoose.model('spotTiming', SpotTimingSchema);
};

