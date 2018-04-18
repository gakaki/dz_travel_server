module.exports = app => {
    const mongoose = app.mongoose;
    const CityShortPathSchema = new mongoose.Schema({
        cid: { type: String }, // 城市id
        city: { type: String }, // 城市名
        shortestDistance: { type: Number }, //最短距离
        minRoad: { type: Array }, //最短走法
        createDate: { type: Date },
    });

    return mongoose.model('CityShortPath', CityShortPathSchema);
};