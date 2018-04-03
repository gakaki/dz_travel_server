module.exports = app => {
    const mongoose = app.mongoose;

    const CompletionDegreeRankSchema = new mongoose.Schema({
        uid: {type: String}, //玩家uid
        completionDegree: {type: Number}, //完成度
        rank: {type: Number}, //排名
        createDate: {type: Date} //创建时间
    });

    return mongoose.model('CompletionDegreeRank', CompletionDegreeRankSchema);
}