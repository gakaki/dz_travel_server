
const _                     = require("lodash");
const travelConfig          = require("../../../sheets/travel");
const QuestRepo             = require("../questService/questRepo");

class RandomEvent {
    constructor( obj ){
        this.spotIds        = obj.line || [];
        if (this.spotIds <= 0) {
            throw new Exception("spod ids can not be null");
            return;
        }
        this.isNewPlayer    = obj.isNewPlayer || 0;
        this.cid            = obj.cid || 0;
        this.weather        = obj.weather || 0;
        this.today          = obj.today || 0;
        this.itemSpecial    = obj.itemSpecial || 0;
        
        this.linesTotal     = []; //总线路内部变量
        this.events         = []; //最后生成的随机事件

        this.setSpotsCfg();
        
        //生成lines 和 events 数据
        this.calcTimeTotal();    // 计算和返回line的时间点
        this.genEventNonSpot();  // 生成事件(非景点)
    }

    calcTimeTotal(){

        let all_time           = 24;                              //6个点5个路程线 总小时 小时为单位 按照步行的速度算

        this.timeCarGreat      = this.timeHuman * 0.6;            // 2.88  	豪华自驾车	租赁豪华自驾车，可缩短60%本城市旅行时间。	1001
        this.timeCarMedium     = this.timeHuman * 0.5;            // 2.4    舒适自驾车	租赁舒适自驾车，可缩短50%本城市旅行时间。	1002
        this.timeCarCheap      = this.timeHuman * 0.4;            // 1.92   经济自驾车	租赁经济自驾车，可缩短40%本城市旅行时间。	1003
        
        //总时间                = 计算该城市有几个line * 单独一个line 4.8个小时 普通走 总时间
        //剩下时间              = （总时间 - 当前行走了多少时间 ） * 0.6
        //总时间新手引导         修改为1个小时
        //当前行走了多少时间 * humanSpeed    
        let timeHumanPreLine   = all_time / ( 6 - 1 );       //一段line 4.8小时
        let lineCount          = this.spotIds.length - 1;    // 几个点-1 为多少个line 线
        let timeTotal          = this.lineCount * timeHumanPreLine; //无道具正常时间 小时单位
        if ( this.isNewPlayer ){
             timeTotal        = 1;
        }
        // 正常走路时间
        this.timeHumanPreLine  = timeHumanPreLine;

        // 计算总时间 并生成具体的 line线
        this.setLines();
        this.timeTotal = this.linesTotal.reduce( (prev, current, index, arr) => {
            return prev.timeElapsed + current.timeElapsed;
        });
    }
    
    setSpotsCfg(){
        this.spotsCfg       = this.spotIds.map(s =>       {
            let tmp =  travelConfig.Scenicspot.Get(s).cfg;
            return tmp;
        });
        this.spotsCfg.forEach( cfg => {
            let [lng,lat] = cfg["coordinate"];
            cfg.lng         = lng;
            cfg.lat         = lat;
        })
    }

    setLines(){
        let linesTotal      = [];
        this.spotsCfg.reduce( (prev, current, index, arr) => {
            let line        = this.getLine(prev, current);
            linesTotal.push(line);
            if ( index == arr.length - 1){

            }else{
                return current
            }
        });
        this.linesTotal     = linesTotal;
    }

    async genEventNonSpot(){
        let eventRows = [];
        let timeTotalMinute = this.timeTotal * 60;
        while ( timeTotalMinute > 0 ) {
            let dbRow = this.genSingleEventNonSpot();
            eventRows.push(dbRow);
            timeTotalMinute = timeTotalMinute - dbRow.minuteLength;
        }
        //创建数据库吧
        this.events = eventRows;
        //将事件发生顺序写入数据库
        // await this.ctx.model.CurrentCity.create(eventRows);
    }

    randomQuest(){
        let quests = QuestRepo.filter(
            {
                // cid :       this.cid,
                // weather:    this.weather,           //天气
                // today:      this.today,             //特定日期
                // itemSpecial:this.itemSpecial,       //特定道具
            }
        );
        //根据权重进行 随机 这里暂时偷懒为了快点出来先
        var randomEl = _.shuffle(quests)[0];
        return randomEl;
    }

    get_trigger_date( minutes  = 0, dt = new Date() ){
        let trigger_date =  new Date(dt.getTime() + minutes*60000);
        return trigger_date;
    }
    genSingleEventNonSpot(){
        let minuteLength =  _.random(5,15); // 随机个5到15分钟的时间出来
        let quest        = this.randomQuest();

        let triggerDate  = this.get_trigger_date( minuteLength );
        let questDbRow   = {
            triggerDate     : triggerDate,
            eid             : quest.id,
            received        : false,    
            minuteLength    : minuteLength,
            quest           : quest
        };
        return questDbRow;
    }

    // 计算每段line的时间 
    getLine(spotStart,spotEnd) {
        // let dis         = this.calcDistance(spotStart,spotEnd);
        // let dis         = this.getFlatternDistance(spotEnd)
        // let timeElapsed = parseInt(dis / this.speed);
        // 不用距离算法了 
        // 中途换道具在写
        let timeElapsed = this.timeHumanPreLine;
        let start       = new Date();
        let end         = start + timeElapsed;
        
        let line        = {
            // distance    : dis,
            timeElapsed : timeElapsed,
            timeStart   : start,
            timeEnd     : end,
            spotStart   : spotStart,
            spotEnd     : spotEnd,
            tracked     : false //是否经过
        }
        return line;
    }
}

module.exports = RandomEvent;
// https://local.ddz2018.com/?sid=042e9de15ad6a0688e040eb7b1b27f9d&uid=ov5W35R-9V5h7f0gpZOJVNJuyabE&cid=101&line=[100107,100102,100109]&appName=travel&action=tour.tourstart
let objParametes   = {
    line           : [100107,100102,100109],
    cid            : 101,
    weather        : 0,
    today          : 0,
    itemSpecial    : 0
};
//
//
// let er      = new RandomEvent(objParametes);
// console.log(er.events);



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