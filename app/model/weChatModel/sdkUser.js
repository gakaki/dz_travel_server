module.exports = app => {
    const mongoose = app.mongoose;
    const SdkUserSchema = new mongoose.Schema({
        userid: { type: String },
        unionid: { type: String },
        appName: { type: String },
        sessionKey: { type: String },
    });

    return mongoose.model('SdkUser', SdkUserSchema);
};

