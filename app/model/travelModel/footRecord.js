module.exports = app => {
    const mongoose = app.mongoose;

    const FootRecordSchema = new mongoose.Schema({
        uid: { type: String }, //玩家uid
        lightCityNum: { type: Number, default: 0 }, //点亮的城市数量
        weekLightCityNum: { type: Number, default: 0 }, //本周点亮的城市数量
        updateDate: { type: Date }, //更新时间
    });

    return mongoose.model('FootRecord', FootRecordSchema);
}