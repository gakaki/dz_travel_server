module.exports = app => {
    const mongoose = app.mongoose;
    const EnglishPKRecordSchema = new mongoose.Schema({
        uid:{type:String},
        season:{type:Number},
        score:{type:Number},
        continuousRight:{type:Number},//连续答对次数
        right:{type:Number},
        mistake:{type:Number},
        startTime:{type:String},
        waitTime:{type:Number},
        isInitiator:{type:Boolean},//是否是发起者
        isFriend:{type:Boolean}, //是否是好友局
        answers:{type:Array},
        opponent:{type:String},//对手
        opponentScore:{type:Number},
        rid:{type:String},
        result: {type:Boolean},//是否获胜
        date:{type:String,default:new Date().toLocaleDateString()},
        time:{type:String,default:new Date().toLocaleTimeString()}

    });

    return mongoose.model('EnglishPKRecord', EnglishPKRecordSchema);
};


