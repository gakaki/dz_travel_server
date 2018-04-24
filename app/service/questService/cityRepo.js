const moment            = require("moment");
const travelsConfig     = require("../../../sheets/travel");
const util              = require("util");
const _                 = require("lodash");

class CityRepo {

    constructor() {
        this.data      = travelsConfig.citys;
    }

    random4(){

    }
}

module.exports = new CityRepo();
