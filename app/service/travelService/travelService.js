const Service = require('egg').Service;

module.exports = app => {
    return class TravelService extends Service {
        async fillIndexInfo(info) {
            // info typeof apis.IndexInfo
            let usr = await this.ctx.model.PublicModel.User.find({uid: info.uid});
            info.isFirst = usr.isFirst;

            info.season = await this.ctx.service.publicService.thirdService.getSeason();
            info.weather = await this.ctx.service.publicService.thirdService.getWeather(usr.city);
            info.playerCnt = await this.ctx.service.publicService.userService.getPlayerCnt();
        }
    }

};