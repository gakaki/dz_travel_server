const Controller = require('egg').Controller;
const apis = require("../../../apis/travel");
const utils = require("../../utils/utils");
const travelConfig = require("../../../sheets/travel");
//走马灯，弹幕相关
class TVController extends Controller {
    async ontelevision(ctx) {
        await ctx.service.travelService.TVService.onTelevision();
    }

}
module.exports = TVController;