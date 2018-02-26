
module.exports = app => {
    const mongoose = app.mongoose;
    const RechargeRecordSchema = new mongoose.Schema({
        orderid: { type: String  },
        appName: { type: String  },
        pid: { type: String  },
        title: { type: String  },
        time: { type: String  ,default:new Date().toLocaleString()},
        price:{type:Number},
        desc:{type:String},
        type:{type:String},
        close:{type:Boolean,default:false},

    });

    return mongoose.model('RechargeRecord', RechargeRecordSchema);
};






