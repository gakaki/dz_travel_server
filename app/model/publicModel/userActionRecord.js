module.exports = app => {
    const mongoose = app.mongoose;
    const UserActionRecordSchema = new mongoose.Schema({
        pid: {type: String},
        appName: {type: String},
        type: {type: Number, enum: [0, 1, 2, 3, 4, 5]},
        data: {type: JSON},
        createDate:{type:Date}

    });

    return mongoose.model('UserActionRecord', UserActionRecordSchema);
};


