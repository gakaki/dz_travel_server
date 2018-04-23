module.exports = app => {
    const mongoose = app.mongoose;
    const PostcardChatWatchSchema = new mongoose.Schema({
        uid: { type: String },
        pscid: { type: String },
        watchDate: { type: Date },
    });

    return mongoose.model('PostcardChatWatch', PostcardChatWatchSchema);
};

