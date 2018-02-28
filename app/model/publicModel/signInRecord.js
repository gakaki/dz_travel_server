module.exports = app => {
    const mongoose = app.mongoose;
    const SignInRecordSchema = new mongoose.Schema({
        uid: {type: String},
        appName: {type: String},
        createTime: {type: String, default: new Date().toLocaleString()},
    });

    return mongoose.model('SignInRecord', SignInRecordSchema);
};

