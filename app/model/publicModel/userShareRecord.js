module.exports = app => {
    const mongoose = app.mongoose;
    const UserShareRecordSchema = new mongoose.Schema({
        uid: {type: String},
        appName: {type: String},
        createTime: {type: String, default: new Date().toLocaleTimeString()},
        createDate: {type: String, default: new Date().toLocaleDateString()},
        num: {type: Number},
        getItem: {type: Boolean},
        itemId: {type: Number}

    });

    return mongoose.model('UserShareRecord', UserShareRecordSchema);
};

