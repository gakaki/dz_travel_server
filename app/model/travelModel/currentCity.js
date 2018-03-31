module.exports = app => {
    const mongoose = app.mongoose;
    const CurrentCitySchema = new mongoose.Schema({
        uid:{type:String},
        cid:{type:String},
        country:{type:String},
        province:{type:String},
        city:{type:String},
        scenicspot:{type:String},
        progress:{type:Number},//完成度
        roadMap:{type:Array},
        friend:{type:String},
        rentItems:{type:JSON}
    });

    return mongoose.model('CurrentCity', CurrentCitySchema);
};

