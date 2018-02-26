

module.exports = app => {
    const mongoose = app.mongoose;
    const StatisticSchema = new mongoose.Schema({
        appName: { type: String  },
        date: { type: String ,default:new Date().toLocaleDateString() },
        loginCount: { type: Number , default:0},
        registerCount: { type: Number,default:0  }

    });

    return mongoose.model('Statistic', StatisticSchema);
};

