const travelConfig = require("../../sheets/travel");
const calendar = require("lunar-calendar");
const utils = require("../utils/utils");

module.exports = {
    schedule: {
        cron: '0 30 0 * * *',      //秒(0-59)，分(0-59)，时(0-23)，日(1-31)，月(1-12)，周(0-7,0和7代表周日)
        type: 'worker', // all 指定所有的 worker 都需要执行
        //immediate: true,
    },
    async task(ctx) {

        if (this.config.isSlave) return;

        ctx.logger.info("每日事件推送");
      let events = travelConfig.events;
      for(let event of events) {
          if(event.inform) {
              let today = new Date();
              if(Number(event.condition2[0])) {
                  let type = event.condition2[0];
                  //1 表示阳历 2 表示阴历
                  let start = new Date(today.getFullYear() + "-" + event.condition2[1]);
                  let end = today;
                  if(event.condition2[2]) {
                       end = new Date(today.getFullYear() + "-" + event.condition2[2] + " 23:59:59");
                  }else{
                      end = new Date(today.getFullYear() + "-" + event.condition2[1] + " 23:59:59");
                  }

                  if(type == 2) {
                      let lunar = calendar.solarToLunar(today.getFullYear(), today.getMonth() + 1, today.getDate());
                      today = new Date(lunar.lunarYear + "-" + lunar.lunarMonth + "-" + lunar.lunarDay);
                  }

                  if(start <= today && today <= end) {
                      ctx.logger.info("今天", today);
                      ctx.logger.info("开始", start);
                      ctx.logger.info("结束", end);
                      ctx.logger.info("属于城市" + event.belong);
                      if(event.belong) {
                          let content = travelConfig.Message.Get(travelConfig.Message.SYSTEMMESSAGE).content;
                          let context = content.replace(new RegExp("s%", "gm"), travelConfig.City.Get(event.belong).city);
                          let users = await ctx.model.PublicModel.User.find({ appName: "travel" });
                          let createDate = new Date();
                          for(let i = 0, length = users.length; i < length; i++) {
                              let user = users[i];
                              await ctx.model.TravelModel.UserMsg.create({
                                  uid: user.uid,
                                  mid: "msg" + travelConfig.Message.SYSTEMMESSAGE + createDate.format("yyyyMMddhhmmss") + i,
                                  type: travelConfig.Message.SYSTEMMESSAGE,
                                  title: travelConfig.Message.Get(travelConfig.Message.SYSTEMMESSAGE).topic,
                                  content: context,
                                  date: createDate,
                              })
                          }

                          break;
                      }
                  }
              }
          }
      }

    },
};