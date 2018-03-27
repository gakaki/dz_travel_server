module.exports = app => {
    const mongoose = app.mongoose;
    const UserMsgSchema = new mongoose.Schema({
        uid:{type:String},
        title:{type:String},
        context:{type:String},
        date:{type:Date}

    });

    return mongoose.model('UserMsg',UserMsgSchema);
};

