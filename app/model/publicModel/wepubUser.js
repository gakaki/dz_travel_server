const travelConfig = require("../../../sheets/travel");

module.exports = app => {
    const mongoose = app.mongoose;
    const WepubUserSchema = new mongoose.Schema({
        uid: { type: String },
        nickName: { type: String },
        sex: { type: Number },
        province: { type: String },
        city: { type: String },
        country: { type: String },
        headimgurl: { type: String },
        privilege: { type: Array }, //用户特权信息，json 数组，如微信沃卡用户为（chinaunicom）
        unionid: { type: String },
    });
    return mongoose.model('WepubUser', WepubUserSchema);
};

