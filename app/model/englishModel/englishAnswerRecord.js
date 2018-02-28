module.exports = app => {
    const mongoose = app.mongoose;
    const EnglishAnswerRecordSchema = new mongoose.Schema({
        uid: {type: String},
        roomId: {type: String},
        gameType:{type:Number},
        answer:{type:Array},
        isRight:{type:Boolean},
        word:{type:JSON},
        date:{type:String,default:new Date().toLocaleDateString()},
        time:{type:String,default:new Date().toLocaleTimeString()}

    });

    return mongoose.model('EnglishAnswerRecord', EnglishAnswerRecordSchema);
};


