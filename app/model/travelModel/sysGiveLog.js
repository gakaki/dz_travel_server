module.exports = app => {
    const mongoose = app.mongoose;
    const SysGiveLogSchema = new mongoose.Schema({
        uid:{type:String},
        sgid:{type:String},//唯一id
        type:{type:Number},//类别    1 用户道具(金币，积分,飞机票) 2 特产 3.明信片 4 体验卡(豪华自驾车,舒适自驾车,经济自驾车,单反相机,高级单反相机,医药箱)
        iid:{type:String},//赠送物品id    金币 1 积分 2 飞机票 11(单人票) ，12(双人票)  其余配表id
        number:{type:Number},//数量
        isAdmin:{type:String},//管理员赠送  系统送的为0 (这一栏是为了后台手动送道具)
        createDate:{type:Date}

    });

    return mongoose.model('SysGiveLog', SysGiveLogSchema);
};

