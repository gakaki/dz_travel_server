module.exports = app => {
    const mongoose = app.mongoose;
    const SpecialitySchema = new mongoose.Schema({
        uid:{type:String},
        spid:{type:String},   //特产ID
        number:{type:Number},
        createDate:{type:Date} //获取时间
    });

    return mongoose.model('Speciality',SpecialitySchema);
};

