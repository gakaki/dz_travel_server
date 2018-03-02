module.exports = app => {
    const mongoose = app.mongoose;
    const EnglishAnswerRecordSchema = new mongoose.Schema({
        uid: {type: String},
        roomId: {type: String},
        type:{type:Number},
        answer:{type:Array},
        isRight:{type:Boolean},
        wid:{type:String},
        date:{type:String,default:new Date().toLocaleDateString()},
        time:{type:String,default:new Date().toLocaleTimeString()}

    });

    return mongoose.model('EnglishAnswerRecord', EnglishAnswerRecordSchema);
};


