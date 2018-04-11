const Service           = require('egg').Service;
const travelConfig      = require("../../../sheets/travel");
const apis              = require("../../../apis/travel");
const shortPath         = require("./shortPath")

class PathService extends Service {

    //给定城市 来计算最短路径
    async shortPath( cid ) {
        let sp =  new shortPath(cid);
        return sp.shortPath();
    }



}


module.exports = PathService;