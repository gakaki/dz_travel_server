module.exports = app => {
    const mongoose = app.mongoose;
    const CityLightLogSchema = new mongoose.Schema({
        uid: { type: String }, //用户uid
        cid: { type: String }, // 城市id
        province: { type: String },
        lighten: { type: Boolean }, //是否已经点亮该城市
        createDate: { type: Date },
    });

    return mongoose.model('CityLightLog', CityLightLogSchema);
};