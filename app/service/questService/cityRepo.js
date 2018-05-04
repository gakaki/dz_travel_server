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

    random4ByCityMoreRange( cid ){
        //随机出一个是该城市的景点，但其他几个不是该城市的 然后乱序一下
        if (!cid) cid = 1;
        let rows        = this.rows.filter( e => e.id == cid );
        let itemsRight  =  _.shuffle(rows).slice(0,1);

        let itemsWrong  = _.shuffle(this.rows).slice(0,3);
        let items       = itemsRight.concat(itemsWrong);

        return items;
    }
}

module.exports = new CityRepo();

