'use strict';

class RandomSeconds {
   // const job_name  = "random_event";
    static randomDefault(){
        let minute_min      = 5 ,
            minute_max      = 15;
        let minutes         =  this._generateNumByNM( minute_min , minute_max );
        let million_seconds = minutes * 60 * 1000;
        return million_seconds;
    }
    static randomTest(){
        let minute_min      = 1 ,
            minute_max      = 5;
        let second          =  this._generateNumByNM( minute_min , minute_max );
        let million_seconds = second  *  1000;
        return million_seconds;
    }
   static _generateNumByNM (minNum,maxNum) {
        //生成从minNum到maxNum的随机数
        switch(arguments.length){
            case 1:
                return parseInt(Math.random()*minNum+1,10);
                break;
            case 2:
                return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
                break;
            default:
                return 0;
                break;
        }
    }
}

module.exports =  RandomSeconds
