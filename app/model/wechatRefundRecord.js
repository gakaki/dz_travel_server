

module.exports = app => {
    const mongoose = app.mongoose;
    const WechatRefundRecordSchema = new mongoose.Schema({
        orderid: { type: String  },
        out_refund_no: { type: String  },
        total_fee: { type: Number  },
        refund_fee: { type: Number  },
        desc: { type: String  },
        pid: { type: String  },
        createTime: { type: String ,default:new Date().toLocaleString() },
        status: { type: String },
        success: { type: Boolean },


    });

    return mongoose.model('WechatRefundRecord', WechatRefundRecordSchema);
};





