module.exports = app => {
    const mongoose = app.mongoose;

    const Address = new mongoose.Schema({
        id: {type: String}, //地址id
        isDefault: {type: Boolean}, //是否为默认地址
        name: {type: String}, //姓名
        tel: {type: String}, //电话
        addr: {type: String}, //详细地址
    })

    return mongoose.model('Address', Address);
}