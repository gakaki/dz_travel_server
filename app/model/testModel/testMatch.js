module.exports = app => {
    const mongoose = app.mongoose;
    const TestMatchSchema = new mongoose.Schema({
        uid: {type: String},
        rankType: {type: String},
        date: {type: String},
        rid: {type: String},

    });

    return mongoose.model('TestMatch', TestMatchSchema);
};

