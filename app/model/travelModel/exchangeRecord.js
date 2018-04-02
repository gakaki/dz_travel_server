module.exports = app => {
    const mongoose = app.mongoose;

    const ExchangeRecord = new mongoose.Schema({
        uid: {type: String}, // 用户uid
        nickName: {type: String},//存一份，方便展示
        avatar: {type: String},//方便展示
        exId: {type: Number}, // 兑换的物品id
        integral: {type: Number}, // 消耗的积分
        exName: {type: String}, // 兑换的物品名,
        tel: {type: String}, //收件人电话
        addr: {type: String}, //收件地址
        sent: {type:Boolean}, //是否已发货
        createDate: {type: Date}
    })

    return mongoose.model('ExchangeRecord', ExchangeRecord);
}