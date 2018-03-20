module.exports = app => {
    const mongoose = app.mongoose;
    const ReferrerSchema = new mongoose.Schema({
        appName: {type: String},
        uid: {type: String},
        path: {type: String}, //打开小程序的路径
        query: {type: JSON},//打开小程序的query
        scene: {type: Number},//打开小程序的场景值
        shareTicket: {type: String},//转发信息
        createDate: {type: String},

});

    return mongoose.model('Referrer', ReferrerSchema);
};

