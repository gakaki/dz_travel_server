const constant = require("../../utils/constant");
const travelConfigs = require("../../sheets/travel");
module.exports = {
    schedule: {
        cron: '0 30 0 * * *',      //秒(0-59)，分(0-59)，时(0-23)，日(1-31)，月(1-12)，周(0-7,0和7代表周日)
        type: 'worker', // all 指定所有的 worker 都需要执行
    },
    async task(ctx) {
      let events = travelConfigs.events;
      for(let event of events){
          if(event.inform){
              let today = new Date();
              if(Number(event.condition2[0])){
                  let type = event.condition2[0];
                  //1 表示阳历 2 表示阴历
                  if(type == 1){
                      let start = new Date(today.getFullYear()+"-" + event.condition2[1]);
                      let end = new Date(today.getFullYear()+"-" + event.condition2[2]);
                      if(start <= today && today >= end){

                      }
                  }
              }
          }
      }

    },
};