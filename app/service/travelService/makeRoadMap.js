
const _                     = require("lodash");
const travelConfig          = require("../../../sheets/travel");
const QuestRepo             = require("../questService/questRepo");
const ScenicPos             = require("../../../sheets/scenicpos");
const moment                = require("moment");

// 生成路线
class MakeRoadMap {

    constructor( obj ){

        this.spotIds        = obj.line || [];
        if (this.spotIds <= 0) {
            throw new Exception("spod ids can not be null");
            return;
        }
        this.isNewPlayer    = obj.isNewPlayer || 0; //新手引导总时间会变成1
        this.cid            = obj.cid || 0;

        this.lines          = []; //所有线路容器

        this.clacSpeed();        // 时间配置
        this.setSpotsCfg();
        this.calcTimeTotal();    // 计算和返回line的时间点
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
        this.timeTotal              = this.lines.reduce( (prev, current, index, arr) => {
            return prev.timeElapsed + current.timeElapsed;
        });
        if ( this.isNewPlayer ){    //新手引导总时间变为1
            this.timeTotal           = 1;
        }
    }

    setSpotsCfg(){
        this.spotsCfg        = this.spotIds.map( (spotId,index) => {
            let cfg          = travelConfig.Scenicspot.Get(spotId);
            let xy           = ScenicPos.Get(spotId);
            let o            = {};
            o.id             = spotId;
            o.cid            = this.cid;
            o.name           = cfg.scenicspot;
            o.building       = cfg.building;
            o.x              = xy.x;
            o.y              = xy.y;
            o.tracked        = false;
            o.index          = index; //这个index 有必要吗
            let [lng,lat]    = cfg["coordinate"];
            o.lng            = lng;
            o.lat            = lat;
            return o;
        });
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
        let start       = new Date().getTime();
        let end         = start + timeHour * 60 * 10000;

        let line        = {
            // distance    : dis,
            timeElapsed : timeHour,
            timeStart   : start,
            timeEnd     : end,
            spotStart   : spotStart,
            spotEnd     : spotEnd,
            timeStartFull : moment(start).format('YYYY-MM-DD HH:mm:ss'),
            timeStartEnd  : moment(end).format('YYYY-MM-DD HH:mm:ss')
        }
        return line;
    }
}

module.exports = MakeRoadMap;

let objParametes   = {
    line           : [100107,100102,100109],
    cid            : 101,
    weather        : 0,
    today          : 0,
    itemSpecial    : 0
};

let er      = new MakeRoadMap(objParametes);
console.log(er.lines);