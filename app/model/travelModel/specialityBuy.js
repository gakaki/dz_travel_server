module.exports = app => {
    const mongoose = app.mongoose;
    //特产购买记录表
    const SpecialityBuySchema = new mongoose.Schema({
        uid:{type:String},
        spid:{type:String},     //特产ID
        number:{type:Number},   //购买数量
       // numberLeft:{type:Number},   //当时买完剩下的
        createDate:{type:Date}  //时间
    });

    return mongoose.model('SpecialityBuy',SpecialityBuySchema);
};

