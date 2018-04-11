
const _ = require("lodash");

class EventRandom {

    constructor( linesFront ){
        this.lineFronts = this.lineFronts;
        this.lines      = [];
        this.events     = [];
        this.timeTotal  = 0;
        this.timeEnd    = "";

        // 20：00 20：15 20：20
  
        // linesFront = {
        //     spotId,
        //     index,
        //     createDate,
        //     tracked, 
        // }
        
    }

    calcTotalTime(){
        let linesTotal      = [];
        this.timeTotal      = this.lineFronts.reduce( ( linePrev, lineCurrent ) => {
            let line        = getLine(linePrev, lineCurrent);
            linesTotal.push(line);
            return line.timeElapsed;
        });
    }
    
    //生成lines 和 events 数据
    gen(){
        // 计算总时间 并生成具体的 line线
        this.calcTotalTime();
        // 生成事件(非景点)
        this.genEventNonSpots();
    }

    genEventNonSpot(){
        let eventRows = [];
        while ( timeTotal < 0 ) {
            let dbRow = genEventNonSpot();
            eventRows.push(dbRow);
            timeTotal = timeTotal - dbRow.timeElapsed;
        }
        await this.ctx.model.CurrentCity.create(eventRows);
        this.events = eventRows;
    }   

    genSingleEventNonSpot(){
        let timeElsaped =  _.random(5,15); // 随机个5到15分钟的时间出来
        let quest       = QuestRepo.random(..samples);
        // write to current city eventlist strim event
        let questDbRow  : {
            createDate : new Date() + elspaed,
            eid         : eid,
            received    : false,
            timeElsaped : timeElsaped,
            quest       : quest
        };
        return questDbRow;
    }

    // 计算每段line的时间 
    getLine(spotStart,spotEnd) {
        let dis         = calcDistance(spotStart.point,spotEnd.point);
        let timeElapsed = dis / speed;
        
        let start       = new Date();
        let end         = start + timeElapsed;
        
        let line        = {
            distance    : dis,
            timeElapsed : timeElapsed,
            start       : start,
            end         : end    
        }
        return line;
    }

    

// 按照index 的节点 生成lines 
    //每段line需要附上时间 计算总时间 
    //5到15分钟random  计算随机事件 写入event 但要注意每段line生成之后的概率变化
    //由于景点事件都不是随机事件


    //注意新手引导的关系 会让加速不少。

    //redis 记录上一次的持续时间 注意数据库需要恢复哦
    //redis 记录用户的状态
    //计算和上一次的触发时间到底差多少

