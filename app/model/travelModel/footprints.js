module.exports = app => {
    const mongoose = app.mongoose;
    const FootprintsSchema = new mongoose.Schema({
        uid:{type:String},
        country:{type:String},
        province:{type:String},
        city:{type:String},
    });

    return mongoose.model('Footprints', FootprintsSchema);
};

