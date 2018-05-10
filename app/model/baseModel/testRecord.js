module.exports = app => {
    const mongoose = app.mongoose;
    const TestRecordSchema = new mongoose.Schema({
        uid: { type: String },
        appName: { type: String },
        time: { type: Date },
        index: { type: String },
        delta: { type: Number },
        type: { type: String },
    });
    TestRecordSchema.pre('save', async function() {
        await doStuff();
        await doMoreStuff();
    });

    return mongoose.model('TestRecord', TestRecordSchema);
};
