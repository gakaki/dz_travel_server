
module.exports = app => {
    const mongoose = app.mongoose;
    const WechatUnifiedOrderSchema = new mongoose.Schema({
        appid: { type: String  },//微信开放平台审核通过的应用APPID
        mch_id: { type: String  },//微信支付分配的商户号
        device_info: { type: String ,default:"WEB" },//终端设备号(门店号或收银设备ID)，默认请传\"WEB\"
        nonce_str: { type: String  },//随机字符串，不长于32位
        sign: { type: String  },//签名
        sign_type: { type: String ,default:"MD5" },//签名类型，目前支持HMAC-SHA256和MD5，默认为MD5
        body: { type: String },//商品描述交易字段格式根据不同的应用场景按照以下格式：APP——需传入应用市场上的APP名字-实际商品名称，天天爱消除-游戏充值。
        detail: { type: String },//商品详细描述，对于使用单品优惠的商户，改字段必须按照规范上传
        attach: { type: String },//"附加数据，在查询API和支付通知中原样返回，该字段主要用于商户携带订单的自定义数据
        out_trade_no: { type: String },//"商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*@ ，且在同一个商户号下唯一
        fee_type: { type: String ,default:"CNY"},//符合ISO 4217标准的三位字母代码，默认人民币：CNY"
        total_fee: { type: Number},//订单总金额，单位为分
        spbill_create_ip: { type: String},//用户端实际ip
        time_start: { type: String},//订单生成时间，格式为yyyyMMddHHmmss，如2009年12月25日9点10分10秒表示为20091225091010
        time_expire: { type: String},//订单失效时间，格式为yyyyMMddHHmmss，如2009年12月27日9点10分10秒表示为20091227091010
        goods_tag: { type: String},//订单优惠标记，代金券或立减优惠功能的参数"
        notify_url: { type: String},//接收微信支付异步通知回调地址，通知url必须为直接可访问的url，不能携带参数。"
        trade_type: { type: String},//"支付类型 JSAPI，NATIVE，APP"
        limit_pay: { type: String},//"no_credit--指定不能使用信用卡支付
        scene_info: { type: String},//"该字段用于统一下单时上报场景信息，目前支持上报实际门店信息。 {"store_id": "", //门店唯一标识，选填，String(32)"store_name":"”//门店名称，选填，String(64) }
        prepay_id: { type: String},//"微信生成的预支付回话标识，用于后续接口调用中使用，该值有效期为2小时
        mweb_url: { type: String},//"没有出现在统一下单的文档中，h5支付的文档有提及
        openid: { type: String},//""trade_type=JSAPI时（即公众号支付），此参数必传，此参数为微信用户在商户对应appid下的唯一标识"
        code_url: { type: String},//""trade_type为NATIVE时有返回，用于生成二维码，展示给用户进行扫码支付
        success: { type: Boolean},//"订单下单成功还是失败
    });

    return mongoose.model('WechatUnifiedOrder', WechatUnifiedOrderSchema);
};


