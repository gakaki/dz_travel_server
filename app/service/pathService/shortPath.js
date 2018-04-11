const Service           = require('egg').Service;
const travelConfig      = require("../../../sheets/travel");
const apis              = require("../../../apis/travel");
const scenicPos         = require("../../../sheets/scenicpos");


class Point {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
    }

    static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.hypot(dx, dy);
    }

    static ranPoints(len) {
        let arr = [];
        for (let i = 0; i < len; i++) {
            arr.push(new Point(i, Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)));
        }
        return arr;
    }

}
const permutator = (inputArr) => {
    let result = [];

    const permute = (arr, m = []) => {
        if (arr.length === 0) {
            result.push(m)
        } else {
            for (let i = 0; i < arr.length; i++) {
                let curr = arr.slice();
                let next = curr.splice(i, 1);
                permute(curr.slice(), m.concat(next))
            }
        }
    }
    permute(inputArr)
    return result;
}

var timer = function(name) {
    var start = new Date();
    return {
        stop: function() {
            var end  = new Date();
            var time = end.getTime() - start.getTime();
            console.log('Timer:', name, 'finished in', time, 'ms');
        }
    }
};

class ShortPath {

    constructor( cid , startPos = {} ){
        let city            = travelConfig.City.Get( cid );

        let spotPoints      = [];
        for ( let spotId of city["scenicspot"] ){
            spotPoints.push(scenicPos.Get(spotId)._cfg);
        }

        this.city           = city;
        this.spotPoints     = spotPoints;
        this.cid            = cid;
        this.startPos       = startPos;
    }

    //给定城市 来计算最短路径
    shortPath() {
        this.fixStartFindPath();
    }

    // 第一个点是固定起点，寻找最短路径
    fixStartFindPath() {
        let points = this.spotPoints;
        let ids = [...points.keys()];
        //去掉 id0 的点
        ids.splice(0,1);
        let perms = permutator(ids);
        let roadValues = [];

        perms.forEach((pids, idx) => {
            let value =  Point.distance(points[0], points[pids[0]]);

            for (let j = 0; j < pids.length-1; j++) {
                value += Point.distance(points[pids[j]], points[pids[j + 1]]);
            }
            roadValues.push(value);

        });

        // console.log(perms);
        // console.log(roadValues);

        let min = roadValues[0];
        let minIdx = 0;
        for (let i = 1; i < roadValues.length; i++) {
            let cur = roadValues[i];
            if (cur < min) {
                min = cur;
                minIdx = i;
            }
        }
        let minRoad = perms[minIdx];
        minRoad.unshift(0)

        console.log(min);
        console.log("road " + minRoad);
        return min;
    }
}

module.exports = ShortPath;


// var t = timer('用暴力法计算运行时间');
// let short_path = new ShortPath( cid = 2 );
// short_path.shortPath();
// t.stop();