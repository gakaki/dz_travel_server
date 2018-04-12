module.exports = app => {
    const mongoose = app.mongoose;
    const CityTourLog = new mongoose.Schema({
        cid: {type: String},// 城市id
        uid: {type: String}, //用户uid
        fid: {type: String},//飞行记录id
        scenicSpots: {type: JSON}, //到过的景点：{id:name,id:name}
        scenicNum: {type: Number}, //到达景点数量
        eventNum: {type: Number}, //触发事件数量
        postcardNum: {type: Number}, //获得明信片数量
        progress: {type: Number}, //城市完成度百分比,根据事件数、到达景点数、明信片数，综合计算的完成度，取值0-100
        efficiency: {type: Number}, //效率评分，根据规划的路径与最短路径比值计算
        lighten: {type: Boolean}, //是否已经点亮该城市
        provinceLighten: {type: Boolean}, //所在省是否点亮
        createDate: {type: Date, default: new Date()}
    })

    return mongoose.model('CityTourLog', CityTourLog);
}