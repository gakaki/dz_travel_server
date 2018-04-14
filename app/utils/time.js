const moment = require("moment");

currentTimestamp = () => {
    return parseInt(Date.now()/1000);
}

formatYMDHMS = (timestamp) => {
    return moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
}
addHour = (currentTime,hours) => {
    let secondAfter  = currentTime + hours * 60 * 60 * 1000;
    return secondAfter;
}

module.exports.currentTimestamp = formatYMDHMS;
module.exports.formatYMDHMS     = formatYMDHMS;
module.exports.addHour          = addHour;

