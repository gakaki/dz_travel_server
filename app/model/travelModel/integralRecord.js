module.exports = app => {
    const mongoose = app.mongoose;

    const IntegralRecordSchema = new mongoose.Schema({
        uid: {type: String}, // 玩家uid
        integral: {type: Number}, //实时积分
        updateDate: {type: Date}, //更新时间
        createDate: {type: Date} //生成榜单时间
    })

    return mongoose.model('IntegralRecord', IntegralRecordSchema);
}