const Service = require('egg').Service;

class TestService extends Service {
    async doubleGuide( uid , friendUid ) {
        await this.ctx.model.PublicModel.User.remove();//deleteMany({ uid: { $in: [uid,friendUid]}})
        await this.ctx.model.TravelModel.CurrentCity.remove();//deleteMany({ uid: { $in: [uid,friendUid]}})
    }
}


module.exports = TestService;