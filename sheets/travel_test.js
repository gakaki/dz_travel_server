const travelConfig = require("./travel");

// travelConfig.Parameter.prototype.Event

console.log(travelConfig.Parameter.EVENTMAX);
console.log(travelConfig.Parameter.Get(travelConfig.Parameter.EVENTMAX).cfg.value);