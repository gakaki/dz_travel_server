module.exports = app => {
    const mongoose = app.mongoose;
    const TemplateMessageSchema = new mongoose.Schema({
        uid: { type: String },
        formId: { type: String },
        canUseNumber: { type: Number, default: 1 },
        createDate: { type: Date },
    });

    return mongoose.model('TemplateMessage', TemplateMessageSchema);
};

