module.exports = app => {
    const mongoose = app.mongoose;
    const PostcardChatSchema = new mongoose.Schema({
        uid:{type:String},//拥有者
        pscid:{type:String},//明信片
        chatid:{type:String},
        sender:{type:String},//回复者
        context:{type:String},
        createDate:{type:Date}
    });

    return mongoose.model('PostcardChat', PostcardChatSchema);
};

