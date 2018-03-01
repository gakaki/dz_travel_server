const engConfig = require("../../../sheets/english")

let stg = engConfig.Stage.Get(1)
console.log(stg.frame);

let arr = engConfig.stages;
console.log('stagearr', arr)