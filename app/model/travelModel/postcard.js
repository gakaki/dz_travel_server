module.exports = app => {
    const mongoose = app.mongoose;
    const PostcardSchema = new mongoose.Schema({
        uid:{type:String},
        cid:{type:String},
        country:{type:String},
        province:{type:String},
        city:{type:String},
        ptid:{type:String},  //明信片配表ID 不唯一
        pscid:{type:String},//明信片专有ID  唯一
        createDate:{type:Date} //创建时间
    });

    return mongoose.model('Postcard', PostcardSchema);
};

