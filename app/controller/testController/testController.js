const Controller = require('egg').Controller;

const constant = require("../../utils/constant");

class TestController extends Controller {

    async clearCurrentCity(ctx) {
        this.logger.info("清空当前城市数据！");

    }

}

module.exports = TestController;
