module.exports = app => {
    const mongoose = app.mongoose;

    const CompletionDegreeRecordSchema = new mongoose.Schema({
        uid: { type: String }, //玩家uid
        cid: { type: String }, //城市id
        completionDegree: { type: Number, default: 0 }, //完成度
        weekCompletionDegree: { type: Number, default: 0 }, //周完成度
        updateDate: { type: Date }, //更新时间
    });

    return mongoose.model('CompletionDegreeRecord', CompletionDegreeRecordSchema);
}