module.exports = app => {
    const mongoose = app.mongoose;
    const TravelLogSchema = new mongoose.Schema({
        uid:{type:String},
        date:{type:String},
        scenicspot:{type:Array}

    });

    return mongoose.model('TravelLog', TravelLogSchema);
};

