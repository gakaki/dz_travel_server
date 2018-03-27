module.exports = app => {
    const mongoose = app.mongoose;
    const ItemRecordSchema = new mongoose.Schema({
        pid: {type: String},
        appName: {type: String},
        time: {type: String},
        index: {type: String},
        delta: {type: Number},
        createDateTime:{type:Date}

    });

    return mongoose.model('ItemRecord', ItemRecordSchema);
};

