module.exports = app => {
    const mongoose = app.mongoose;
    const ExchangeCondition = new mongoose.Schema({
        rank: {type: Number}, //要求的最大排名
        integral: {type: Number}, //要求的最小积分
    })

    return mongoose.model('ExchangeCondition', ExchangeCondition);
}