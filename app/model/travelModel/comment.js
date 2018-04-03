module.exports = app => {
    const mongoose = app.mongoose;
    const CommentSchema = new mongoose.Schema({
        uid:{type:String},
        cid:{type:String},
        type:{type:Number,enum:[1,2]},//1 攻略 2 特产
        travel_tips:{type:String}, //攻略特产id
        comid:{type:String}, //评论id 唯一
        context:{type:String}, //内容
        grade:{type:Number},  //打分
        likes:{type:Number,default:0},  //点赞
        createDate:{type:Date}

    });

    return mongoose.model('Comment', CommentSchema);
};

