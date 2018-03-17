const Controller = require('egg').Controller;
const apis = require('../../../apis/travel');
//旅行出发相关
class TravelController extends Controller {
    async index(ctx) {
        let info = apis.IndexInfo.Init(ctx);

        //read info's prop by client

        //write info's prop to client
        this.service.travelService.travelService.fillIndexInfo(info);
        //send data
        info.submit();
    }
}

module.exports = TravelController;