module.exports = app => {
    const mongoose = app.mongoose;
    const PackGuessRecordSchema = new mongoose.Schema({
        pid: {type: String},
        uid: {type: String},
        createTime: {type: String, default: new Date().toLocaleString()},
        userAnswerWord: {type: String},
        userMark: {type: String},
        userGetMoney: {type: Number},
        commit: {type: String}

    });

    return mongoose.model('PackGuessRecord', PackGuessRecordSchema);
};


