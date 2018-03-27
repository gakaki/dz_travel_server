module.exports = app => {
    const mongoose = app.mongoose;
    const TestMatchSchema = new mongoose.Schema({
        uid: {type: String},
        rankType: {type: String},
        date: {type: String},
        rid: {type: String},
        isMatch:{type:Boolean,default:false},
        isOver:{type:Boolean,default:false}

    });

    return mongoose.model('TestMatch', TestMatchSchema);
};

