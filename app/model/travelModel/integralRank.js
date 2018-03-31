module.exports = app => {
    const mogoose = app.mongoose;

    const IntegralRankSchema = new mogoose.Schema({
        uid: {type: String}, //玩家uid
        integral: {type: Number}, //积分数量
        rank: {type: Number}, //排名
        createDate: {type: Date} //创建时间
    });

    return mongoose.model('IntegralRank', IntegralRankSchema);
}