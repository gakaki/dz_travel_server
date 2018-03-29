module.exports = app => {
    const mongoose = app.mongoose;
    const UserSchema = new mongoose.Schema({
        pid: {type: String},//平台号
        uid: {type: String},//如果是第三方登陆，则返回UID
        appName: {type: String},//小程序名称
        nickName: {type: String},//用户名
        avatarUrl: {type: String},//头像url
        gender: {type: Number},//用户的性别，值为1时是男性，值为2时是女性，值为0时是未知
        city: {type: String},//城市
        province: {type: String},//省
        country: {type: String},//国家
        location: {type: String},//当前所在地
        language: {type: String},//用户的语言，简体中文为zh_CN
        online: {type: Boolean},//是否在线
        third: {type: Boolean, default: false},//第三方
        registertime: {type: Date},//注册时间
        items: {type: JSON}, //道具
        friendList:{type:Array},
        isFirst:{type:Boolean,default:true},
        mileage:{type:Number,default:0},  //里程数
        name:{type:String},
        birth:{type:String},
        mobile:{type:String},
        address:{type:String}
    });

    return mongoose.model('User', UserSchema);
};

