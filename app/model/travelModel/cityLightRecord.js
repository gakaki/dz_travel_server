module.exports = app => {
    const mongoose = app.mongoose;

    //城市点亮记录表 暂存表 用incr 每完成一个景点incr一次吧
    const CityLightRecordSchema = new mongoose.Schema({

        uid:{type:String},          //用户id
        cid:{type:String},          //城市id
        cityId:{type:String},       //城市id
        spotId:{type:String},       //景点id
        
    });

    return mongoose.model('cityLightRecord', CityLightRecordSchema);
};

