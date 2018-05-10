module.exports = app => {
    const mongoose = app.mongoose;
    const ShowShopSchema = new mongoose.Schema({
        id: { type: Number },
       show: { type: Boolean },
    });

    return mongoose.model('ShowShop', ShowShopSchema);
};

