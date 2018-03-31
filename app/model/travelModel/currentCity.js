module.exports = app => {
    const mongoose = app.mongoose;
    const CurrentCitySchema = new mongoose.Schema({
        uid:{type:String},
        fid:{type:String},//飞行记录id
        cid:{type:String},
        sspid:{type:String},//景点id
        progress:{type:Number},//完成度
        roadMap:{type:Array},
        friend:{type:String},
        rentItems:{type:JSON}
    });

    return mongoose.model('CurrentCity', CurrentCitySchema);
};

