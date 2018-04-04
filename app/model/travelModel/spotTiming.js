module.exports = app => {
    const mongoose = app.mongoose;

    //用户当前景点记录表 这个可以用来作为用户的当前游玩路径表 这个应该就一行记录
    const SpotTimingSchema = new mongoose.Schema({
        uid:{type:String},          //用户id
        cid:{type:String},          //城市id
        spotIdCur:{type:String},    //当前景点id    当前景点等于最后景点了
        spotIdNext:{type:String},   //目标景点id
        historySpots:{type:Array},  //历史景点id
        isFinished:{type:Number},   //说明这个城市的景点走到顶了
        createDate:{type:Date}      //创建时间 当前景点出发的时间 然后当前时间记录下 可以获得多少时间到
    });

    return mongoose.model('spotTiming', SpotTimingSchema);
};

