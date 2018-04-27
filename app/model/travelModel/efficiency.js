module.exports = app => {
    const mongoose = app.mongoose;
    const EfficiencySchema = new mongoose.Schema({
        uid: { type: String },
        cid: { type: String }, //结算的城市id
        fid: { type: String }, //结算的飞行记录
        efficiency: { type: Number },
        reward: { type: Number },
        createDate: { type: Date },
    });

    return mongoose.model('Efficiency', EfficiencySchema);
};