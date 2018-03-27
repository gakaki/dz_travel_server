module.exports = app => {
    const mongoose = app.mongoose;
    const CommentSchema = new mongoose.Schema({
        uid:{type:String},
        commented:{type:Number,enum:[0,1]},
        comId:{type:Number},
        context:{tyep:String}, //内容
        grade:{type:Number},  //打分
        likes:{type:Number},  //点赞
        createDate:{type:Date}

    });

    return mongoose.model('Comment', CommentSchema);
};

