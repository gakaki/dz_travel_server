module.exports = app => {
    const mongoose = app.mongoose;
    const FlyTicketSchema = new mongoose.Schema({
        uid:{type:String},
        isGive:{type:Number,enum:[0,1]}, //机票类型 0：买的 1：送的
        flyType:{type:Number,enum:[1,2]}, //机票类型    1 单人 2双人
        cid:{type:String},//目的地
        number:{type:Number},
    });

    return mongoose.model('FlyTicket',FlyTicketSchema);
};

