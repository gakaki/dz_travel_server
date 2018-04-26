module.exports = app => {
    const mongoose = app.mongoose;
    const ItemRecordSchema = new mongoose.Schema({
        uid: { type: String },
        appName: { type: String },
        time: { type: Date },
        index: { type: String },
        delta: { type: Number },
        type: { type: String },

    });

    return mongoose.model('ItemRecord', ItemRecordSchema);
};

