module.exports = app => {
    const mongoose = app.mongoose;
    const ShortPathSchema = new mongoose.Schema({
        cid: { type: String },
        short: { type: Number },
    });

    return mongoose.model('ShortPath', ShortPathSchema);
};

