module.exports = app => {
    const mongoose = app.mongoose;
    const CurrentCitySchema = new mongoose.Schema({
        uid: { type: String },
        fid: { type: String }, //飞行记录id
        cid: { type: String },
        sspid: { type: String }, //景点id
        //progress: { type: Number }, //完成度？
        efficiency: { type: Number }, //效率评分，根据规划的路径与最短路径比值计算 ???可能不用入库
        friend: { type: String, default: "0" }, //默认单人旅行
        rentItems: { type: JSON },
        photographyCount: { type: Number, default: 0 }, //城市拍照次数 前2次免费
        photographySpots: { type: Array, default: [] }, //拍照的景点id
        tourCount: { type: Number, default: 0 }, //城市观光次数 前2次免费
        rewardAppendTime: Array, //被奖励？惩罚的 该城市游玩追加时间可以为负数
        roadMap: { type: Array, default: [] }, //玩家当前地图
        events: { type: Array, default: null },
        modifyEventDate: { type: Date, default: null },
        startTime: { type: Date }, //开始游玩的时间
    });

    return mongoose.model('CurrentCity', CurrentCitySchema);
};

