module.exports = app => {
    const mongoose = app.mongoose;
    const CityEventsSchema = new mongoose.Schema({
        uid: { type: String },
        events: { type: Array, default: [] },  //cid也不需要了如果当前城市永远只有一个的话
    });

    return mongoose.model('CityEvents', CityEventsSchema);
};

