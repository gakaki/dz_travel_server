module.exports = app => {
    const mongoose = app.mongoose;
    const LikeRecordSchema = new mongoose.Schema({
        uid:{type:String},
        comid:{type:Number},
        createDate:{type:Date}

    });

    return mongoose.model('LikeRecord', LikeRecordSchema);
};

