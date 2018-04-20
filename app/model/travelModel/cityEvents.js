module.exports = app => {
    const mongoose = app.mongoose;
    const CityEventsSchema = new mongoose.Schema({
        uid: { type: String },
        cid: { type: String },
        events: { type: Array, default: [] },
    });

    return mongoose.model('CityEvents', CityEventsSchema);
};

