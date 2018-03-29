module.exports = app => {
    const mongoose = app.mongoose;
    const UserShareRecordSchema = new mongoose.Schema({
        uid: {type: String},
        appName: {type: String},
        createDate:{type:Date},
        num: {type: Number},
        getItem: {type: Boolean},
        itemId: {type: Number}
    });

    return mongoose.model('UserShareRecord', UserShareRecordSchema);
};

