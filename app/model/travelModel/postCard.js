module.exports = app => {
    const mongoose = app.mongoose;
    const PostCardSchema = new mongoose.Schema({
        uid:{type:String},
        cid:{type:String},
        country:{type:String},
        province:{type:String},
        city:{type:String},
        ptid:{type:String},  //明信片配表ID
        pscid:{type:String},//明信片专有ID
        createDate:{type:Date} //创建时间
    });

    return mongoose.model('PostCard', PostCardSchema);
};

