module.exports = app => {
    const mongoose = app.mongoose;
    const UserShareRecordSchema = new mongoose.Schema({
        uid: {type: String},
        appName: {type: String},
        createTime: {type: String},
        createDate: {type: String},
        num: {type: Number},
        getItem: {type: Boolean},
        itemId: {type: Number}
    });

    return mongoose.model('UserShareRecord', UserShareRecordSchema);
};

