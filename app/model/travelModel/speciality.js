module.exports = app => {
    const mongoose = app.mongoose;
    const SpecialitySchema = new mongoose.Schema({
        cid: {type: String}, //所属城市id
        uid:{type:String},
        spid:{type:String},   //特产ID
        price: {type: Number}, //买入价格
        sellPrice: {type: Number, default: 0}, //异地出售价格
        number:{type:Number, default: 0},
        createDate:{type:Date, default: new Date() }, //获取时间
        sellPriceDate: {type: Date, default: new Date()} //价格刷新时间
    });

    return mongoose.model('Speciality',SpecialitySchema);
};

