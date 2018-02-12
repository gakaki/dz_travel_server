
module.exports = app => {
    const mongoose = app.mongoose;
    const WechatPayResultsSchema = new mongoose.Schema({
        appid: { type: String  },//"微信开放平台审核通过的应用APPID
        mch_id: { type: String  },//"微信支付分配的商户号
        device_info: { type: String  },//"微信支付分配的终端设备号
        nonce_str: { type: String  },//"随机字符串，不长于32位
        sign: { type: String  },//"签名
        openid: { type: String  },//"用户在商户appid下的唯一标识
        is_subscribe: { type: String  },//"is_subscribe
        trade_type: { type: String  },//"APP
        bank_type: { type: String  },//"银行类型，采用字符串类型的银行标识
        total_fee: { type: Number  },//"订单总金额，单位为分"
        fee_type: { type: String  },//货币类型，符合ISO4217标准的三位字母代码"
        cash_fee: { type: Number  },//现金支付金额
        cash_fee_type: { type: String  },//货币类型，符合ISO4217标准的三位字母代码
        coupon_fee: { type: Number  },//"代金券或立减优惠金额<=订单总金额，订单总金额-代金券或立减优惠金额=现金支付金额
        coupon_count: { type: Number  },//""代金券或立减优惠使用数量
        coupon_id_$n: { type: String  },//"""代金券或立减优惠ID,$n为下标，从0开始编号
        coupon_fee_$n: { type: String  },//""单个代金券或立减优惠支付金额,$n为下标，从0开始编号"
        transaction_id: { type: String  },//"微信支付订单号
        out_trade_no: { type: String  },//"商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_-|*@ ，且在同一个商户号下唯一。
        attach: { type: String  },//"商家数据包，原样返回
        time_end: { type: String  },//"支付完成时间，格式为yyyyMMddHHmmss，如2009年12月25日9点10分10秒表示为20091225091010
        result_code: { type: String  },//"
        err_code: { type: String  },//"
        err_code_des: { type: String  },//"
        return_code: { type: String  },//"
        return_msg: { type: String  },//"
        status: { type: Number  },//"处理状态码

    });

    return mongoose.model('WechatPayResults', WechatPayResultsSchema);
};




