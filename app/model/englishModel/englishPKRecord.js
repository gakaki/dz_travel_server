module.exports = app => {
    const mongoose = app.mongoose;
    const EnglishPKRecordSchema = new mongoose.Schema({
        uid:{type:String},
        score:{type:Number},
        continuousRight:{type:Number},
        right:{type:Number},
        mistake:{type:Number},
        startTime:{type:String},
        waitTime:{type:Number},
        isInitiator:{type:Boolean},
        isFriend:{type:Boolean},
        opponent:{type:String},
        opponentScore:{type:Number},
        roomId:{type:String},
        result: {type:Boolean},
        date:{type:String,default:new Date().toLocaleDateString()},
        time:{type:String,default:new Date().toLocaleTimeString()}

    });

    return mongoose.model('EnglishPKRecord', EnglishPKRecordSchema);
};


