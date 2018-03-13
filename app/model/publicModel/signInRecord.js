module.exports = app => {
    const mongoose = app.mongoose;
    const SignInRecordSchema = new mongoose.Schema({
        uid: {type: String},
        appName: {type: String},
        createDate: {type: String, default: new Date().toLocaleDateString()},
        createTime: {type: String, default: new Date().toLocaleTimeString()},
    });

    return mongoose.model('SignInRecord', SignInRecordSchema);
};

