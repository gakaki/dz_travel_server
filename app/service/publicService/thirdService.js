const Service = require('egg').Service;
const season = require('date-season');
const holiday = require('holiday.cn');
const weather = require('weather-china');

module.exports = app => {
    return class ThirdService extends Service{
        async getSeason() {

        }

        async getWeather() {

        }

        async getHoliday(date=null) {

        }
    }
}