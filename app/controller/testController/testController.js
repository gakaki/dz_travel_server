const apis = require("../../../apis/travel");

const Controller = require('egg').Controller;

const constant = require("../../utils/constant");
const travelConfig = require("../../../sheets/travel");
class TestController extends Controller {

    //起飞
    async testfly(ctx) {
        let info = apis.TestStartGame.Init(ctx);
        let currentCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: info.uid });
        let ui = await this.ctx.model.PublicModel.User.findOne({ uid: info.uid });
        if(!ui) {
            info.code = apis.Code.USER_NOT_FOUND;
            return;
        }
        await this.service.travelService.travelService.visit(info, ui, currentCity, null);
        info.submit();
    }


    async testtourindex(ctx) {
        let info = apis.TestTourIndexInfo.Init(ctx);
        let ui = await this.ctx.model.PublicModel.User.findOne({ uid: info.uid });
        await this.service.travelService.tourService.tourindexinfo(info, ui);
        info.submit();
    }
    async testsetroute(ctx) {
        let info = apis.TestSetRouter.Init(ctx);
        let cfg = travelConfig.City.Get(info.cid);
        if(!cfg) {
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            return;
        }
        info.line = JSON.stringify(cfg.scenicspot);
        let ui = await this.ctx.model.PublicModel.User.findOne({ uid: info.uid });
        await this.service.travelService.tourService.setrouter(info, ui);
        info.submit();
    }

    async testplayloop(ctx) {
        let info = apis.TestPlayLoop.Init(ctx);
        await this.ctx.service.travelService.tourService.playloop(info);
        info.submit();
    }

    async testfreshspots(ctx) {
        let info = apis.TestFreshSpots.Init(ctx);
        await this.service.travelService.tourService.freshspots(info);
        info.submit();
    }
}

module.exports = TestController;
