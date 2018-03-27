module.exports = app => {
    const mongoose = app.mongoose;
    const EnglishAnswerRecordSchema = new mongoose.Schema({
        uid: {type: String},
        roomId: {type: String},
        type:{type:Number},
        answer:{type:Array},
        isRight:{type:Boolean},
        wid:{type:Number},
        date:{type:String},
        time:{type:String},
        createDateTime:{type:Date}

    });

    return mongoose.model('EnglishAnswerRecord', EnglishAnswerRecordSchema);
};


