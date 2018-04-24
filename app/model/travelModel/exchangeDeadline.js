module.exports = app => {
    const mongoose = app.mongoose;

    const ExchangeDeadline = new mongoose.Schema({
        endtime: { type: Date },
        createDate: { type: Date }, //创建时间
    });

    return mongoose.model('ExchangeDeadline', ExchangeDeadline);
}