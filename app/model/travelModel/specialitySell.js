module.exports = app => {
    const mongoose = app.mongoose;
    //特产出售记录表
    const SpecialitySellSchema = new mongoose.Schema({
        uid:{type:String},
        spid:{type:String},     //特产ID
        number:{type:Number},   //卖出数量
        //numberLeft:{type:Number},   //当时卖出剩下的
        createDate:{type:Date}  //时间
    });

    return mongoose.model('SpecialitySell',SpecialitySellSchema);
};

