module.exports = app => {
    const mongoose = app.mongoose;
    const PostCardSchema = new mongoose.Schema({
        uid:{type:String},
        pscid:{type:Number},  //明星片ID
        number:{type:Number},
        createDate:{type:Date} //创建时间
    });

    return mongoose.model('PostCard', PostCardSchema);
};

