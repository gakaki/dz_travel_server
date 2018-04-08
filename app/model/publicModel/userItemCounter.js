module.exports = app => {
    const mongoose = app.mongoose;
    const UserItemCounterSchema = new mongoose.Schema({
        total: {type: Number},//当前总量
        addup: {type: Number},//历史增量
        cost: {type: Number},//历史花费
        delta: {type: Number},//最近一次操作
        index: {type: String},//道具索引
        uid: {type: String},
        appName: {type: String},

    });

    return mongoose.model('UserItemCounter', UserItemCounterSchema);
};

