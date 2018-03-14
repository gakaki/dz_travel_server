//@flow
const Controller = require('egg').Controller;
const api = require('../../../apis/api');
const apis = require('../../../apis/travel');
//旅行出发相关
class TravelController extends Controller {
    @api(apis.IndexInfo)
    async index(ctx: Context) {
        let info = ctx.api;
        //read info's prop by client

        //write info's prop to client
        this.service.travelService.travelService.fillIndexInfo(info);
        //send data
        info.submit();
    }
}

module.exports = TravelController;