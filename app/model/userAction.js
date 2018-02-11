

module.exports = app => {
    const mongoose = app.mongoose;
    const UserActionSchema = new mongoose.Schema({
        pid: { type: String  },
        router: { type: String  },
        count: { type: Number  },
        time:{type:String}

    });

    return mongoose.model('UserAction', UserActionSchema);
};


