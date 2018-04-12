module.exports = app => {
    const mongoose = app.mongoose;
    const FootRankSchema = new mongoose.Schema({
        uid: { type: String }, //玩家uid
        lightCityNum: { type: Number }, //本周点亮的城市数
        rank: { type: Number }, //排名
        createDate: { type: Date }, //创建时间
    });

    return mongoose.model('FootRank', FootRankSchema);
};

