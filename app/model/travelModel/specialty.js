module.exports = app => {
    const mongoose = app.mongoose;
    const SpecialtySchema = new mongoose.Schema({
        uid:{type:String},
        spid:{type:Number},   //特产ID
        number:{type:Number},
        createDate:{type:Date} //获取时间
    });

    return mongoose.model('Specialty',SpecialtySchema);
};

