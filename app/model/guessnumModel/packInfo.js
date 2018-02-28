const config = require('../../../config/guessnum/configs');

module.exports = app => {
    const mongoose = app.mongoose;
    const PackInfoSchema = new mongoose.Schema({
        pid: {type: String},
        orderId: {type: String},
        uid: {type: String},
        money: {type: Number},
        remain: {type: Number},
        createTime: {type: String, default: new Date().toLocaleString()},
        password: {type: String},
        title: {type: String},
        guessCount: {type: Number, default: Number(config.Parameter.Get("timeslimit").value)},
        useTicket: {type: Boolean},
        AAAA: {type: Boolean, default: false},
        AAA: {type: Boolean, default: false},
        AA: {type: Boolean, default: false},
        A: {type: Boolean, default: false},
        miss: {type: Boolean, default: false},
        status: {type: String},
        CDList: {type: JSON, default: {}}
    });

    return mongoose.model('PackInfo', PackInfoSchema);
};

