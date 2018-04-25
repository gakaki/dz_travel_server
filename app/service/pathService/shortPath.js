const Service           = require('egg').Service;
const travelConfig      = require("../../../sheets/travel");
const apis              = require("../../../apis/travel");
const scenicPos         = require("../../../sheets/scenicpos");

let EARTH_RADIUS = 6371.0;

class Point {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
    }

    //坐标算法
    static distance(a, b) {
        if (!a || !b || !a.x || !b.x) return;
        let vLon = Math.abs(a.x - b.x);
         let vLat = Math.abs(a.y - b.y);


        return Math.sqrt(Math.pow(vLon, 2) + Math.pow(vLat, 2));
    }


    //经纬度算法
    static mileage(a, b) {
        let lat1 = this.ConvertDegreesToRadians(a[0]);
        let lon1 = this.ConvertDegreesToRadians(a[1]);
        let lat2 = this.ConvertDegreesToRadians(b[0]);
        let lon2 = this.ConvertDegreesToRadians(b[1]);

        let vLon = Math.abs(lon1 - lon2);
        let vLat = Math.abs(lat1 - lat2);
        let h = this.HaverSin(vLat) + Math.cos(lat1) * Math.cos(lat2) * this.HaverSin(vLon);

        return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(h));
    }




    static ConvertDegreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    static HaverSin(theta) {
        let v = Math.sin(theta / 2);
        return v * v;
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
    //let length = 0;
    let length = inputArr.length;
    length = length - 6 < 0 ? 0 : length - 6;
    const permute = (arr, m = []) => {
        if (arr.length === length) {
            result.push(m)
           // console.log(m);
        } else {
            for (let i = 0; i < arr.length; i++) {
                let curr = arr.slice();
                let next = curr.splice(i, 1);
                permute(curr.slice(), m.concat(next))
            }
        }
    };
    permute(inputArr);
    return result;
};

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
    constructor(cid) {
        let city = travelConfig.City.Get(cid);

        let spotPoints = [];
        for(let spotId of city["scenicspot"]) {
            if(scenicPos.Get(spotId)) {
            spotPoints.push(scenicPos.Get(spotId));
            }
        }

        //console.log(spotPoints);
        this.city           = city;
        this.spotPoints     = spotPoints;
        this.cid            = cid;
        this.startPos       = scenicPos.Get(cid);
        this.startLLPos     = travelConfig.City.Get(cid).coordinate;
        //console.log( this.startPos )
    }

    //给定城市 来计算最短路径
    shortPath(realRoute) {
        return this.fixStartFindPath(realRoute);
    }

    getDistance(map) {
        let value = 0;
        if(map.length == 1) {
             value = Point.distance(this.startPos, scenicPos.Get(map[0]));
        }else{
            for (let j = 0; j < map.length - 1; j++) {
                value += Point.distance(scenicPos.Get((map[j])), scenicPos.Get(map[j + 1]));
            }
        }

        return value
    }

    getMileage(map) {
        let value = 0;
        if(map.length == 1) {
            value = Point.mileage(this.startLLPos, travelConfig.Scenicspot.Get(map[0]).coordinate);
        }else{
            for (let j = 0; j < map.length - 1; j++) {
                value += Point.mileage(travelConfig.Scenicspot.Get(map[j]).coordinate, travelConfig.Scenicspot.Get(map[j + 1]).coordinate);
            }
        }

        return value
    }

    travelShortDistance(travelMap, extraRoute = 0) {
        if(travelMap.length > 6) {
            travelMap = travelMap.slice(0, 6);
            extraRoute = 0;
        }

       // console.log(travelMap);
        let value = Point.distance(this.startPos, scenicPos.Get(travelMap[0]));
        for (let j = 0; j < travelMap.length - 1; j++) {
            value += Point.distance(scenicPos.Get((travelMap[j])), scenicPos.Get(travelMap[j + 1]));
        }

        return value + extraRoute;
    }

    // 第一个点是固定起点，寻找最短路径
    fixStartFindPath(realRoute) {
        let points = this.spotPoints;
       if(realRoute && realRoute.length) {
           let pArr = [];
           for(let r of realRoute) {
               pArr.push(scenicPos.Get(r));
           }
           if(pArr.length) {
               points = pArr;
           }
       }
        let ids = [...points.keys()];
        //去掉 id0 的点
      //  ids.splice(0,1);
        let perms = permutator(ids);
        console.log(perms.length);
        let roadValues = [];
        perms.forEach((pids, idx) => {
            let value = Point.distance(this.startPos, points[pids[0]]);
          //  console.log(this.startPos)
          //  console.log(points[pids[0]])
          //  console.log(value)
            for (let j = 0; j < pids.length - 1; j++) {
                value += Point.distance(points[pids[j]], points[pids[j + 1]]);
            }

     //       console.log(value);

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
       // minRoad.unshift(0)
        console.log(this.cid);
        console.log(min);
        console.log("road " + minRoad);
        return {
            min: min,
            minRoad: minRoad,
        };
    }
}

module.exports = ShortPath;


// var t = timer('用暴力法计算运行时间');
// let short_path = new ShortPath( 1 );
// //short_path.shortPath();
// let a = Math.round(short_path.getMileage([100101]));
// console.log(a);
// t.stop();