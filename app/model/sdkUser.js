
module.exports = app => {
    const mongoose = app.mongoose;
    const SdkUserSchema = new mongoose.Schema({
        userId: { type: String  },

    });

    return mongoose.model('SdkUser', SdkUserSchema);
};

