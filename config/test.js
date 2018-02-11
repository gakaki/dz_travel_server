const configs=require('./configs');
const crypto = require("crypto");
const moment = require("moment");
const utils=require('./../app/utils/utils');


let cfgAAAA= configs.configs().Distribution.Get(4);

/*Math.random() * (to - from) + from*/


console.log(moment().format('YYYYMMDDhhmmssSS'));
