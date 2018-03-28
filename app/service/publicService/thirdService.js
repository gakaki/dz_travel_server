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
         let meteorological =await weather(city);
        let weather = meteorological.now.text;
        this.logger.info('weather', weather);
        return weather;
    }

     getHoliday(date=new Date()) {
         let holiday = holiday(date);
         this.logger.info('holiday', holiday);
        return holiday
    }

    async getRandomTicket(uid){
        let cityPool = travelConfig.citys;
        let footprints = await this.ctx.model.TravelModel.FlightRecord.aggregate([{ $match: {"uid":uid} }]).group({ _id: "$destination"});
        if(cityPool.length == footprints.length){
            let index = utils.Rangei(0,cityPool.length);
            return (index+1).toString();
        }else{
            for(let city of cityPool){
                for(let cid of footprints){
                    if(cid._id != city.id){
                        cid = city.id;
                        return (city.id).toString();
                    }
                }
            }
        }

    }
}


module.exports = ThirdService;