module.exports = app => {
    const mongoose = app.mongoose;
    const ItemRecordSchema = new mongoose.Schema({
        pid: {type: String},
        appName: {type: String},
        time: {type: String, default: new Date().toLocaleString()},
        index: {type: Number},
        delta: {type: Number}

    });

    return mongoose.model('ItemRecord', ItemRecordSchema);
};

