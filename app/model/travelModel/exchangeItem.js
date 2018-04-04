module.exports = app => {
    const mongoose = app.mongoose;
    const ExchangeItem = new mongoose.Schema({
        id: {type: String},//物品Id
        url: {type: String}, //图片
        name: {type: String}, //物品名
        integral: {type: Number}, //需要积分数
    });

    return mongoose.model('ExchangeItem', ExchangeItem);
}