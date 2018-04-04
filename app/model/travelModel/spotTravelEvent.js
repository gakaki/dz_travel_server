module.exports = app => {
    const mongoose = app.mongoose;
    const SpotTravelEventSchema = new mongoose.Schema({
        uid:{type:String},
        eid:{type:String},      //事件id
        cid:{type:String},      //cityId
        spotId:{type:String},   //景点id
        isPhotography:{type:Boolean}, //是否拍照
        createDate:{type:Date}
    });

    return mongoose.model('SpotTravelEvent', SpotTravelEventSchema);
};

