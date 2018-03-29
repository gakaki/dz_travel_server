const travelConfig = require("../../../sheets/travel");

const Service = require('egg').Service;
const season = require('date-season')({north: true, autumn: true});
const holiday = require('holiday.cn').default;
const weather = require('../../utils/weather');
const utils = require("../../utils/utils");

class ThirdService extends Service{
     getSeason() {
        let s = season(new Date()).toUpperCase();
        this.logger.info('season', s);
        return s;
    }

    async getWeather(city) {
         try{
             let meteorological =await weather(city);
             let weathers = meteorological.now.text;
             this.logger.info('weather', weathers);
             return weathers;
         }catch(err){
             this.logger.error("获取天气失败",err);
             return "晴"
         }

    }

     getHoliday(date=new Date()) {
         let holidays = holiday(date);
         this.logger.info('holiday', holidays);
        return holidays
    }

    async getRandomTicket(uid){
        let cityPool = travelConfig.citys;
        let footprints = await this.ctx.model.TravelModel.FlightRecord.aggregate([{ $match: {"uid":uid} }]).group({ _id: "$destination"});
        this.logger.info(cityPool.length);
        this.logger.info(footprints);
        if(footprints.length == 0 || cityPool.length == footprints.length){
            let index = utils.Rangei(0,cityPool.length);
            return (index+1).toString();
        }else{
          let fpsSet = new Set();
          for(let cid of footprints){
              fpsSet.add(Number(cid._id));
          }
          let totalSet = new Set();
          for(let city of cityPool){
              totalSet.add(city.id)
          }
          let difference = new Set([...totalSet].filter(x => !fpsSet.has(x)));
          let random = utils.shuffle(Array.from(difference));
          return random[0];
        }

    }
}


module.exports = ThirdService;