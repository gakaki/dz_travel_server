const travelConfig = require("../../../sheets/travel")
const moment = require("moment");
const holidayCn = require('holiday.cn').default;



let context = travelConfig.Message.Get(travelConfig.Message.POSTCARDMESSAGE).content;
let content = context.replace("s%","haha");
console.log(context);
console.log(content);