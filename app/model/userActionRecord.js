

module.exports = app => {
    const mongoose = app.mongoose;
    const UserActionRecordSchema = new mongoose.Schema({
        pid: { type: String  },
        type: { type: Number ,enum:[ 0,1,2,3,4,5] },
        time: { type: String ,default:new Date().toLocaleTimeString() },
        date: { type: String , default:new Date().toLocaleDateString()},
        data: { type: JSON  },

    });

    return mongoose.model('UserActionRecord', UserActionRecordSchema);
};


