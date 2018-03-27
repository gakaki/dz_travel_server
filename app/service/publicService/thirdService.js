const Service = require('egg').Service;
const season = require('date-season')({north: true, autumn: true});
const holiday = require('holiday.cn').default;
const weather = require('../../utils/weather');

module.exports = app => {
    return class ThirdService extends Service{
        async getSeason() {
            let s = season(new Date()).toUpperCase();
            this.logger.info('season', s);
            return s;
        }

        async getWeather(city) {
            return await weather(city);
        }

        async getHoliday(date=null) {
            let h = holiday(new Date('2018-2-15'));
            this.logger.info('got holiday info test', h)
        }
    }
}