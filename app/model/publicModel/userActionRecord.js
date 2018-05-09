module.exports = app => {
    const mongoose = app.mongoose;
    const UserActionRecordSchema = new mongoose.Schema({
        pid: { type: String },
        appName: { type: String },
        type: { type: Number },
        data: { type: JSON },
        createDate: { type: Date },

    });

    return mongoose.model('UserActionRecord', UserActionRecordSchema);
};


