module.exports = app => {
    const mongoose = app.mongoose;
    const PhotoLogSchema = new mongoose.Schema({
        uid: { type: String },
        fid: { type: String }, //飞行日志
        cid: { type: String }, //城市id
        spotId: { type: String }, //景点id
        postcardId: { type: String }, //获得的明信片id
        createDate: { type: Date },

    });

    return mongoose.model('PhotoLog', PhotoLogSchema);
};

