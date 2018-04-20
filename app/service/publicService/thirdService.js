const Service = require('egg').Service;
const season = require('date-season')({ north: true, autumn: true });
const holiday = require('holiday.cn').default;
const weather = require('../../utils/weather');
const utils = require("../../utils/utils");
const travelConfig = require("../../../sheets/travel");

class ThirdService extends Service {
     getSeason() {
        let s = season(new Date()).toUpperCase();
        this.logger.info('season', s);
        return s;
    }

    async getWeather(cid = 1) {
             this.logger.info(`需要获取天气的城市编号 ${cid}`);
             let key = "weather" + Math.round(parseInt(cid) / 100);
             let cityweather = await this.app.redis.hget(key, parseInt(cid));
             this.logger.info("缓存的天气", cityweather);
             if(!cityweather) {
                 try{
                     let meteorological = await weather(travelConfig.City.Get(cid).city, this);
                     cityweather = meteorological.now.cond_txt;
                  //   this.logger.info(meteorological);
                 }catch (err) {
                     this.logger.error("获取天气失败", err);
                     return 1
                 }
                 this.logger.info('weather', cityweather);
                 let map = {
                     [cid]: cityweather,
                 };
                 await this.app.redis.hmset(key, map);
                 //return cityweather
             }
             this.logger.info('weather', cityweather);
             let outw = 1;
             for (let we of travelConfig.weathers) {
                 if (we.weather == cityweather) {
                     outw = we.id;
                     break;
                 }
             }

             return outw;


    }


    getHoliday(date = new Date()) {
         let holidays = holiday(date);
         this.logger.info('holiday', holidays);
        return holidays
    }

    async getRandomTicket(uid, localcid) {
        let cityPool = travelConfig.citys;
        let footprints = await this.ctx.model.TravelModel.FlightRecord.aggregate([{ $match: { uid: uid } }]).group({ _id: "$destination" });
     //   this.logger.info(cityPool.length);
      //  this.logger.info(footprints);
        if(footprints.length == 0 || cityPool.length == footprints.length) {
            let index = utils.Rangei(0, cityPool.length);
            while((index + 1) == localcid) {
                index = utils.Rangei(0, cityPool.length)
            }
            return (index + 1);
        }else{
            let fpsSet = new Set();
            for(let cid of footprints) {
                fpsSet.add(Number(cid._id));
            }
            let totalSet = new Set();
            for(let city of cityPool) {
                totalSet.add(city.id)
            }
            let difference = new Set([ ...totalSet ].filter(x => !fpsSet.has(x)));
            let random = utils.shuffle(Array.from(difference));
            return random[0];
        }
    }

}


module.exports = ThirdService;