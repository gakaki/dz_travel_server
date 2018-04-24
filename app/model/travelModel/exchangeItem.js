module.exports = app => {
    const mongoose = app.mongoose;
    const ExchangeItem = new mongoose.Schema({
        id: {type: String},//物品Id
        pic: {type: String}, //图片
        name: {type: String}, //物品名
        integral: {type: Number}, //需要积分数
        time1:{type:Date},
        time2:{type:Date},
        type:{type:Number}, //是否需要兑换地址,1为需要,2为不需要
        ranking:{type:Number},   //兑换物品需要的排行
        ifLimited:{type:Number}, //是否限购
        introduce:{type:Array}, //产品介绍
        remaining:{type:Number}  //可兑换的产品剩余数
    });

    return mongoose.model('ExchangeItem', ExchangeItem);
}