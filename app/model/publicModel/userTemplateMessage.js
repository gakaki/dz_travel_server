module.exports = app => {
    const mongoose = app.mongoose;
    const UserTemplateMessageSchema = new mongoose.Schema({
        uid: { type: String },
        formId: { type: String },
        templateId: { type: String },
        keyword1: { type: String },
        keyword2: { type: String },
        createDate: { type: Date },
    });

    return mongoose.model('UserTemplateMessage', UserTemplateMessageSchema);
};