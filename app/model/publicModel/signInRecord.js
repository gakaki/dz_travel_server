module.exports = app => {
    const mongoose = app.mongoose;
    const SignInRecordSchema = new mongoose.Schema({
        uid: {type: String},
        appName: {type: String},
        createDate: {type: String},
        createTime: {type: String},
    });

    return mongoose.model('SignInRecord', SignInRecordSchema);
};
