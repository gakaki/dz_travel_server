module.exports = app => {
    const mongoose = app.mongoose;
    const TravelEventSchema = new mongoose.Schema({
        uid:{type:String},
        eid:{type:String},//事件id
        cid:{type:String},
        createDate:{type:Date}
    });

    return mongoose.model('TravelEvent', TravelEventSchema);
};

