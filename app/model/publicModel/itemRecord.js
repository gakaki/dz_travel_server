module.exports = app => {
    const mongoose = app.mongoose;
    const ItemRecordSchema = new mongoose.Schema({
        pid: {type: String},
        appName: {type: String},
        time: {type: Date},
        index: {type: String},
        delta: {type: Number},

    });

    return mongoose.model('ItemRecord', ItemRecordSchema);
};

