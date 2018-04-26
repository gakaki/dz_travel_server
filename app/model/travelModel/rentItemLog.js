module.exports = app => {
    const mongoose = app.mongoose;
    const RentItemLogSchema = new mongoose.Schema({
        cid: { type: String }, //所属城市id
        uid: { type: String },
        rentId: { type: Number },
        createDate: { type: Date }, //获取时间

    });

    return mongoose.model('RentItemLog', RentItemLogSchema);
};

