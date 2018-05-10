const travelConfig = require("../../../sheets/travel");
const _                 = require("lodash");

class ScenicspotRepo {
    find(row_id) {
        return this.rows.find( e  => e.id == row_id );
    }
    constructor() {
        this.rows  = travelConfig.scenicspots.filter(  e=> e.scenicspot != null )
        this.allrights = [];
    }

    random4ByCityMoreRange( cid ){
        //随机出一个是该城市的景点，但其他几个不是该城市的 然后乱序一下
        if (!cid) cid   = 1;
        let rightRows   = this.rows.filter( e => e.cityid == cid );
        this.allrights  = rightRows.map(  e => e.scenicspot );
        let rightItem   =  _.shuffle(rightRows).slice(0,1);
        rightItem       = rightItem.length > 0 ? rightItem[0] : null
        if (!rightItem){
            throw new Error("未找到正确的答案");
        }
        let itemsWrong  =  _.shuffle(this.rows).filter( e => e.cityid != cid ).slice(0,3);
        let wrongs      = itemsWrong.map( e => e.scenicspot);

        return {
            allrights: this.allrights,
            answer : rightItem.scenicspot,
            wrongs : _.shuffle(wrongs),
            picture: rightItem.picture
        };
    }

}
module.exports = new ScenicspotRepo();


