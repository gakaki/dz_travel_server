const travelConfig = require("../../sheets/travel");
const calendar = require("lunar-calendar");
const utils = require("../utils/utils");
module.exports = {
    schedule: {
        cron: '0 30 0 * * *',      //秒(0-59)，分(0-59)，时(0-23)，日(1-31)，月(1-12)，周(0-7,0和7代表周日)
        type: 'worker', // all 指定所有的 worker 都需要执行
    },
    async task(ctx) {
      let events = travelConfig.events;
      for(let event of events){
          if(event.inform){
              let today = new Date();
              if(Number(event.condition2[0])){
                  let type = event.condition2[0];
                  //1 表示阳历 2 表示阴历
                  let start = new Date(today.getFullYear()+"-" + event.condition2[1]);
                  let end = new Date(today.getFullYear()+"-" + event.condition2[2]);
                  if(type == 2){
                      let lunar = calendar.solarToLunar(today.getFullYear(),today.getMonth()+1,today.getDate());
                      today = new Date(lunar.lunarYear+"-"+lunar.lunarMonth+"-"+lunar.lunarDay);
                  }
                  if(start <= today && today >= end){
                      if(event.belong){
                          let content = travelConfig.Message.Get(travelConfig.Message.SYSTEMMESSAGE).value;
                          let context = content.replace("s%",travelConfig.City.Get(event.belong).city);
                          let users = ctx.model.PublicModel.User.find({appName:"travel"});
                          let createDate = new Date();
                          users.map(async (user,index) => {
                              await ctx.model.TravelModel.UserMsg.create({
                                  uid:user.uid,
                                  mid:"msg"+travelConfig.Message.SYSTEMMESSAGE+createDate.format("yyyyMMddhhmmss")+index,
                                  type:travelConfig.Message.SYSTEMMESSAGE,
                                  title:travelConfig.Message.Get(travelConfig.Message.SYSTEMMESSAGE).topic,
                                  content:context,
                                  date:createDate
                              })
                          });
                      }
                  }
              }
          }
      }

    },
};