

module.exports = app => {
    const mongoose = app.mongoose;
    const WechatPaytoUserRecordSchema = new mongoose.Schema({
        nonce_str:{type:String},
        partner_trade_no :{type:String},
        amount:{type:Number},
        spbill_create_ip :{type:String},
        mch_appid:{type:String},
        mchid :{type:String},
        device_info:{type:String,default:"WEB"},
        sign_typeL:{type:String,default:"MD5"},
        check_name:{type:String},
        desc:{type:String},
        openid :{type:String},
        created :{type:String},
        createTime:{type:String},
        success:{type:Boolean}


    });

    return mongoose.model('WechatPaytoUser', WechatPaytoUserRecordSchema);
};


















