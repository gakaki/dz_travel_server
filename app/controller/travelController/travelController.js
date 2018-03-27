const Controller = require('egg').Controller;
const apis = require('../../../apis/travel');
//旅行出发相关
class TravelController extends Controller {
    async index(ctx) {
        let info = apis.IndexInfo.Init(ctx);

        //read info's prop by client

        //write info's prop to client
        await this.service.travelService.travelService.fillIndexInfo(info);
        //send data
        info.submit();
    }

    async gotravel(ctx){
        ctx.service.travelService.travelService.goTravel(info);
    }

    async letsgo(ctx){
        ctx.service.travelService.travelService.letsGo(info);
    }
}

module.exports = TravelController;