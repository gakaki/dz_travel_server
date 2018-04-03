module.exports = app => {
    const mongoose = app.mongoose;

    const CompletionDegreeRecordSchema = new mongoose.Schema({
        uid: {type: String}, //玩家uid
        scenicspots:{type:Number,default:0},//用户到达的全国景点数
        postcards:{type:Number,default:0},//用户收集的全国明信片数
        events:{type:Number,default:0},//用户触发的全国事件数
        completionDegree:{type:Number,default:0},//完成度
        updateDate: {type: Date} //更新时间
    });

    return mongoose.model('CompletionDegreeRecord', CompletionDegreeRecordSchema);
}