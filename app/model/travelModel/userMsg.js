module.exports = app => {
    const mongoose = app.mongoose;
    const UserMsgSchema = new mongoose.Schema({
        uid:{type:String},
        mid:{type:String},
        type:{type:Number},
        title:{type:String},
        content:{type:String},
        isRead:{type:Boolean,default:false},
        date:{type:Date}

    });

    return mongoose.model('UserMsg',UserMsgSchema);
};

