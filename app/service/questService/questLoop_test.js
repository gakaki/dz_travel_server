const questLoop  = require("./questLoop");
const time       = require("../../utils/time");
const intervalSecond = 2 * 1000;


const loopFun = () => {

    console.log( intervalSecond , time.currentYMDHMS()  );
    //记录playloop上回访问的时间点
    

    //计算和当前时间具体差了多少来生成事件数量

    //推送到redis中

    ///每次取栈顶的事件

    //同时要注意还有暂停的功能

    //redis model save


};

//模拟2秒请求playloop
setInterval( loopFun ,intervalSecond );