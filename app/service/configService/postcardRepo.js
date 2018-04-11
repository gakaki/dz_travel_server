'use strict';

const travelConfig = require("../../../sheets/travel");

let __instance = (function () {
  let instance;
  return (newInstance) => {
    if (newInstance) instance = newInstance;
    return instance;
  }
}());

class Postcard {
    constructor(row) {
       this.data        = row;
       this.id          = row['id'];
       this.patternid   = row['pattern'];
       this.picture     = row['picture'];
       this.cid         = row['cityid'];
       this.type        = row['type'];

    }
}
class PostcardRepo {
    randomCitySpecial( cid ){
        // 3 -1 那个事件奖励 来自城市的特产 明信片                  
        let rows    = this.rows.filter( r =>  r.cid == cid && r.type == 2 );   //2 表示是特产明信片
        var random  = rows[Math.floor(Math.random()*rows.length)]
        return random;
    }
    find(row_id) {
        return this.rows.find( e  => e.id == row_id );
    }
    constructor() {
        if (__instance()) return __instance();

        this.rows = [];
        for(let row of travelConfig.postcards){
            this._add(row)
        }
        
        __instance(this);
    }
    _add(row){
        let r = new Postcard(row);
        this.rows.push(r)
    }
}

module.exports = new PostcardRepo();
