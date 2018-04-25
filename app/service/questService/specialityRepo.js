const travelConfig  = require("../../../sheets/travel");
const _                 = require("lodash");

class SpecialityRepo {
    find(row_id) {
        return this.rows.find( e  => e.id == row_id );
    }
    constructor() {
        this.rows  = travelConfig.specialitys.filter(  e=> e.specialityname != null )
    }

    random4ByCity( cid ){
        if (!cid) cid = 1;
        let rows  = this.rows.filter( e => e.cityid == cid );
        let items =  _.shuffle(rows).slice(0,4);
        return items;
    }
}
module.exports = new SpecialityRepo();

