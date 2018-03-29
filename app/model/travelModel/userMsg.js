module.exports = app => {
    const mongoose = app.mongoose;
    const UserMsgSchema = new mongoose.Schema({
        uid:{type:String},
        title:{type:String},
        context:{type:String},
        isRead:{type:Boolean,default:false},
        date:{type:Date}

    });

    return mongoose.model('UserMsg',UserMsgSchema);
};

