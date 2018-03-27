module.exports = app => {
    const mongoose = app.mongoose;
    const TravelLogSchema = new mongoose.Schema({
        uid:{type:String},
        date:{type:String},
        city:{type:String},
        rentCarType:{type:Number},
        scenicspot:{type:Array},
        createDate:{type:Date}

    });

    return mongoose.model('TravelLog', TravelLogSchema);
};

