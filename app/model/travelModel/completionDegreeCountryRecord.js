module.exports = app => {
    const mongoose = app.mongoose;

    const CompletionDegreeCountryRecordSchema = new mongoose.Schema({
        uid: { type: String }, //玩家uid
        completionDegree: { type: Number, default: 0 }, //完成度
        weekCompletionDegree: { type: Number, default: 0 }, //周完成度
        updateDate: { type: Date }, //更新时间
    });

    return mongoose.model('CompletionDegreeCountryRecord', CompletionDegreeCountryRecordSchema);
}