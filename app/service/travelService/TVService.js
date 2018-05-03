const Service = require('egg').Service;
const travelConfig = require("../../../sheets/travel");
const apis = require("../../../apis/travel");
const moment = require("moment");
const utils = require("../../utils/utils");

class TVService extends Service {
    async onTelevision(info) {

    }
}


module.exports = TVService;