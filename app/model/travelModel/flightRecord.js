module.exports = app => {
    const mongoose = app.mongoose;
    const FlightRecordSchema = new mongoose.Schema({
        uid:{type:String},             //用户ID
        from:{type:String},           //出发地
        destination:{type:String},   //目的地
        ticketType:{type:Number,enum:[0,1]},//机票类型
        isDoublue:{type:Boolean,default:false},//是否双人旅行
        friend:{type:String},                    //双人旅行同伴
        cost:{type:Number},                        //花费的金币
        createDate:{type:Date}

    });

    return mongoose.model('FlightRecord', FlightRecordSchema);
};

