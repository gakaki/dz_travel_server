module.exports = app => {
    const mongoose = app.mongoose;
    const CommentSchema = new mongoose.Schema({
        uid:{type:String},
        scenicspot:{type:String},//景点id
        commenttype:{type:Number,enum:[0,1]},//0 攻略 1 特产
        travel_tips:{type:String}, //攻略特产id
        comid:{type:String}, //评论id
        context:{tyep:String}, //内容
        grade:{type:Number},  //打分
        likes:{type:Number},  //点赞
        createDate:{type:Date}

    });

    return mongoose.model('Comment', CommentSchema);
};

