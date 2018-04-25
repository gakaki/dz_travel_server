const moment            = require("moment");
const travelsConfig     = require("../../../sheets/travel");
const util              = require("util");
const _                 = require("lodash");

class CityRepo {

    find(row_id) {
        return this.rows.find( e  => e.id == row_id );
    }
    constructor() {
        this.rows  = travelsConfig.citys.filter(  e=> e.city != null )
    }

    random4ByCity( cid ){
        if (!cid) cid = 1;
        let rows  = this.rows.filter( e => e.id == cid );
        let items =  _.shuffle(rows).slice(0,4);
        return items;
    }
}

module.exports = new CityRepo();

