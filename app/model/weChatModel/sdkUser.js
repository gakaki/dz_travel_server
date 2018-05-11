module.exports = app => {
    const mongoose = app.mongoose;
    const SdkUserSchema = new mongoose.Schema({
        userid: { type: String },
        unionid: { type: String },
        appName: { type: String },
        sessionKey: { type: String },
        authNumber: { type: Number, default: 0 }, //授权次数
    });

    return mongoose.model('SdkUser', SdkUserSchema);
};

