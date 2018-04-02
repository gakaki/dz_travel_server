module.exports = app => {
    const mongoose = app.mongoose;
    const FootprintsSchema = new mongoose.Schema({
        uid:{type:String},
        fid:{type:String},//飞行记录id
        cid:{type:String},//城市编号
        country:{type:String},
        province:{type:String},
        city:{type:String},
        scenicspot:{type:String},
        createDate:{type:Date}
    });

    return mongoose.model('Footprints', FootprintsSchema);
};

