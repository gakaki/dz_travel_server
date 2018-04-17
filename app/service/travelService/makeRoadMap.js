const _                     = require("lodash");
const travelConfig          = require("../../../sheets/travel");
const QuestRepo             = require("../questService/questRepo");
const ScenicPos             = require("../../../sheets/scenicpos");
const timeUtil              = require("../../utils/time");

// 生成路线
class MakeRoadMap {

    constructor( obj ){
        this.oldLine      = obj.oldLine;
        this.spotIds        = obj.line || [];
        if (this.spotIds <= 0) {
            throw "spod ids can not be null";
            return;
        }
        this.isNewPlayer    = obj.isNewPlayer || 0; //新手引导总时间会变成1
        this.cid            = obj.cid || 0;

        this.lines          = []; //所有线路容器
        this.linesFormat    = []; //返回给前端用的

        this.clacSpeed();        // 时间配置
        this.setSpotsCfg();
        this.calcTimeTotal();    // 计算和返回line的时间点
        this.formatOutput();      // 输出最后的结果
    }



    formatOutput(){
        let formatRoadMap = [];
        for ( let line of this.lines ){
            let row = {};

            let spotStart       = line['spotStart'];
            let spotEnd         = line['spotEnd'];
            spotEnd['endTime']  = line['timeEnd'];


            if ( this.lines.indexOf(line) == 0 ) {
                formatRoadMap.push(spotStart);
                formatRoadMap.push(spotEnd);
            }else{
                formatRoadMap.push(spotEnd);
            }
        }

       // console.log(formatRoadMap);

        for ( let line of formatRoadMap ){
            if ( line['isStart'] == 1) {
                line['arriveStamp']         = line['startTime'];
                line['arriveStampYMDHMS']   = timeUtil.formatYMDHMS(line['startTime']);
            }else{
                line['arriveStamp']         = line['endTime'];
                line['arriveStampYMDHMS']   = timeUtil.formatYMDHMS(line['endTime']);
            }
        }

        this.linesFormat        = formatRoadMap;
        // this.linesFormat        = {
        //     timeTotalHour : this.timeTotalHour,
        //     roadMap   : formatRoadMap
        // };

    }

    clacSpeed(){
        let all_time                 = 24;                              //6个点5个路程线 总小时 小时为单位 按照步行的速度算
        //总时间                = 计算该城市有几个line * 单独一个line 4.8个小时 普通走 总时间
        //剩下时间              = （总时间 - 当前行走了多少时间 ） * 0.6
        //总时间新手引导         修改为1个小时
        //当前行走了多少时间 * humanSpeed
        let timeHumanPreLineHour     = all_time / ( 6 - 1 );       //一段line 4.8小时
        // 正常走路时间
        this.timeHumanPreLineHour    = timeHumanPreLineHour;
        this.timeCarGreat            = timeHumanPreLineHour * 0.6;            // 2.88  	豪华自驾车	租赁豪华自驾车，可缩短60%本城市旅行时间。	1001
        this.timeCarMedium           = timeHumanPreLineHour * 0.5;            // 2.4    舒适自驾车	租赁舒适自驾车，可缩短50%本城市旅行时间。	1002
        this.timeCarCheap            = timeHumanPreLineHour * 0.4;            // 1.92   经济自驾车	租赁经济自驾车，可缩短40%本城市旅行时间。	1003
    }
    calcTimeTotal(){

        let lineCount                = this.spotIds.length - 1;    // 几个点-1 为多少个line 线
        let timeTotal                = lineCount * this.timeHumanPreLineHour; //无道具正常时间 小时单位

        // 计算总时间 并生成具体的 line线
        this.setLines();

        this.timeTotalHour           = 0;
        for (let l of this.lines){
            this.timeTotalHour     += l['timeElapsed'];
        }

        // this.timeTotalHour           = this.lines.map( s => s.timeElapsed ).reduce( (pre,cur) => {return pre + cur} );
        if ( this.isNewPlayer ){    //新手引导总时间变为1
            this.timeTotalHour       = 1;
        }
        this.timeTotalHour           = parseFloat((this.timeTotalHour).toPrecision(4))
    }

    setSpotsCfg(){
        let hasRouter = [];
       // let spotsCityStart = null;
        this.spotsCfg        = this.spotIds.map( (spotId,index) => {
            let cfg          = travelConfig.Scenicspot.Get(spotId);
            let xy           = ScenicPos.Get(spotId);
            let o            = {};


           // let oldindex = this.oldLine.findIndex((n) => n.id == spotId);
            let old = this.oldLine.find((n) => n.id == spotId);

            if( !old || !old.tracked || old.index == -1 ) {
                o.id             = spotId;
                o.cid            = this.cid;
                o.name           = cfg.scenicspot;
                o.building       = cfg.building;
                o.x              = xy.x;
                o.y              = xy.y;
                o.tracked        = false;
                o.index          = index; //这个index 有必要吗
                o.startTime      = "";    //开始时间
                o.startime      ="";    //不是很清楚 和以上的区别
                o.endTime        = "";    //结束时间
                o.endtime        = "";    //不是很清楚 和以上的区别
                let [lng,lat]    = cfg["coordinate"];
                o.lng            = lng;
                o.lat            = lat;
            }else{
                hasRouter.push(old.index);
                o = old;
            }
            return o;
        });
       if(hasRouter.length == 0) {
           //忘记加上起始点的了 加上起始点
           let  cityConfig      = travelConfig.City.Get(this.cid);
           let [lng,lat]        = cityConfig["coordinate"];
           let spotsCityStart   = {
               id             : -1, //-1 表示是起点
               cid            : this.cid,
               name           : "城市的起点",
               x              : 0,   //这里的不算数
               y              : 0,
               tracked        : true,  //起点肯定默认就到达了
               index          : 0,     //这个index 有必要吗
               startTime      : "",    //开始时间
               endTime        : "",    //结束时间
               lng            : lng,
               lat            : lat,
               isStart        : true //是否起点
           };
           this.spotsCfg.unshift(spotsCityStart);
       }





    }

    setLines(){
        let linesTotal      = [];
        this.spotsCfg.reduce( (prev, current, index, arr) => {

            let line        = this.makeLine(prev, current);
            linesTotal.push(line);
            if ( index == arr.length - 1 ){

            }else{
                return current
            }
        });
        this.lines     = linesTotal;
    }

    // 计算每段line的时间
    makeLine(spotStart, spotEnd) {
        // let dis         = this.calcDistance(spotStart,spotEnd);
        // let dis         = this.getFlatternDistance(spotEnd)
        // let timeElapsed = parseInt(dis / this.speed);
        // 不用距离算法了
        // 中途换道具在写
        let timeHour    = this.timeHumanPreLineHour;
        let diffTime    = timeHour * 60 * 60 * 1000;

        if (spotStart['isStart'] == true) {
            if(!spotStart['startime']) {
                let start       = new Date().getTime();
                let end         = start + diffTime;

                spotStart['startime']   = start;
                spotEnd['endtime']      = end;
            }
        }else{
            if(!spotStart['startime']) {
                spotStart['startime']   = spotStart['endtime'];
                spotEnd['endtime']      = spotStart['endtime'] + diffTime;
            }

        }


        let line        = {
            // distance    : dis,
            timeElapsed : timeHour,
            timeStart   : spotStart['startime'],
            timeEnd     : spotEnd['endtime'],
            spotStart   : spotStart,
            spotEnd     : spotEnd,
            spotIdStart : spotStart.id,
            spotIdEnd   : spotEnd.id,
            timeStartFull : timeUtil.formatYMDHMS(spotStart['startime']),
            timeStartEnd  : timeUtil.formatYMDHMS(spotEnd['endtime'])
        }
        return line;
    }
}

module.exports = MakeRoadMap;


// let objParametes   = {
//     line           : [100107,100102,100109],
//     cid            : 101,
//     weather        : 0,
//     today          : 0,
//     itemSpecial    : 0
// };
//
// let er      = new MakeRoadMap(objParametes);
// console.log(er.lines);
// console.log(er.timeTotalHour);
// console.log(er.linesFormat);






// console.log(new Date() /1000 * 1000);

// const EARTH_RADIUS = 6378137.0;    //单位M
// const PI = Math.PI;// lat 34 lng 118

// class EventEnvSpeed {
//     constructor(){
//         //普通步行速度 大约需要6个景点24小时，然后现在要是只有1个小时需要调整这个参数
//                             //小时为单位 按照步行的速度算
//         // 1	豪华自驾车	租赁豪华自驾车，可缩短60%本城市旅行时间。	1001
//         // 2	舒适自驾车	租赁舒适自驾车，可缩短50%本城市旅行时间。	1002
//         // 3    经济自驾车	租赁经济自驾车，可缩短40%本城市旅行时间。	1003
//         this.timeHuman         = this.all_time / ( 6 - 1 );        //一段line 4.8小时  6个点5个路程线
//         this.timeCarGreat      = this.timeHuman * 0.6;            // 2.88
//         this.timeCarMedium     = this.timeHuman * 0.5;            // 2.4
//         this.timeCarCheap      = this.timeHuman * 0.4;            // 1.92

//         this.speedHuman        = 2 * 60 * 60;                           // 一小时7200米
//         this.lineMeters        = this.speed_human * this.timeHuman;     //一段line那么长
//         this.speedCarGreate    = this.speedHuman / 0.6;
//         this.speedCarMedium    = this.speedHuman / 0.5;
//         this.speedCarCheap     = this.speedHuman / 0.4;

//         this.speed             = this.speed_human;
//         // this.speed          = 0; //1分钟多少米
//         // this.SPEED_FOOT     = 100; //走路
//         // this.SPEED_MOTO     = 1000;//moto
//         // this.SPEED_CAR      = 2000;//car
//         // this.speed          = this.SPEED_FOOT;
//     }
// }


// 按照index 的节点 生成lines
//每段line需要附上时间 计算总时间
//5到15分钟random  计算随机事件 写入event 但要注意每段line生成之后的概率变化
//由于景点事件都不是随机事件


//注意新手引导的关系 会让加速不少。

//redis 记录上一次的持续时间 注意数据库需要恢复哦
//redis 记录用户的状态
//计算和上一次的触发时间到底差多少



// var arr = [1,2,3,4];
// let res = arr.reduce( (prev, current, index, arr) => {
//     console.log(prev, current, index, arr);
//     if (index == arr.length - 1){
//
//     }else{
//         return current
//     }
// }); // return 10
// console.log(res);
// 这是计算x y坐标的距离
// calcDistance( spotStartObj ,spotEndObj ){
//     let dx = spotStartObj.x - spotEndObj.x;
//     let dy = spotStartObj.y - spotEndObj.y;
//     return parseInt(Math.hypot(dx, dy));
// }
/** http://www.cnblogs.com/cocowool/archive/2009/03/24/1420478.html
 function getRad(d){ * approx distance between two points on earth ellipsoid
            return d*PI/180.0; * @param {Object} lat1
        } * @param {Object} lng1
 * @param {Object} lat2
 * @param {Object} lng2
 */
//
// getRad(d){
//     return d*PI/180.0;
// }
//
// getFlatternDistance(lat1,lng1,lat2,lng2){
//     var f = this.getRad((lat1 + lat2)/2);
//     var g = this.getRad((lat1 - lat2)/2);
//     var l = this.getRad((lng1 - lng2)/2);
//
//     var sg = Math.sin(g);
//     var sl = Math.sin(l);
//     var sf = Math.sin(f);
//
//     var s,c,w,r,d,h1,h2;
//     var a = EARTH_RADIUS;
//     var fl = 1/298.257;
//
//     sg = sg*sg;
//     sl = sl*sl;
//     sf = sf*sf;
//
//     s = sg*(1-sl) + (1-sf)*sl;
//     c = (1-sg)*(1-sl) + sf*sl;
//
//     w = Math.atan(Math.sqrt(s/c));
//     r = Math.sqrt(s*c)/w;
//     d = 2*w*a;
//     h1 = (3*r -1)/2/c;
//     h2 = (3*r +1)/2/s;
//
//     return d*(1 + fl*(h1*sf*(1-sg) - h2*(1-sf)*sg));
// }