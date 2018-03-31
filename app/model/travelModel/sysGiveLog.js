module.exports = app => {
    const mongoose = app.mongoose;
    const SysGiveLogSchema = new mongoose.Schema({
        uid:{type:String},
        sgid:{type:String},
        iid:{type:String},//赠送物品id
        number:{type:Number},//数量
        isAdmin:{type:String},//管理员赠送
        createDate:{type:Date}

    });

    return mongoose.model('SysGiveLog', SysGiveLogSchema);
};

