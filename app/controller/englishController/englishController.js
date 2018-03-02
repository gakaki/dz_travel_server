const Controller = require('egg').Controller;
const constant = require("../../utils/constant");


class EnglishController extends Controller {
    async showpersonal(ctx) {
        const {_sid, appName} = ctx.query;
        let result = {};
        if (!_sid || !appName) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        let show=await this.service.englishService.englishService.showPersonal(ui);
        result.code=constant.Code.OK;
        result.data=show;
        ctx.body=result;
    }

    async signin(ctx){
        const {_sid, appName} = ctx.query;
        let result = {};
        if (!_sid || !appName) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        await this.service.englishService.englishService.signin(ui,appName);
        result.code=constant.Code.OK;
        ctx.body=result;
    }

    async develop(ctx){
        const {_sid, appName} = ctx.query;
        let result = {};
        if (!_sid || !appName) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        await this.service.englishService.englishService.develop(ui,appName);
        result.code=constant.Code.OK;
        ctx.body=result;
    }




    async getfriendrankinglist(){
        const {_sid, appName} = ctx.query;
        let result = {};
        if (!_sid || !appName) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        await this.service.englishService.englishService.getFriendRankingList(ui,appName);
        result.code=constant.Code.OK;
        ctx.body=result;
    }


}

module.exports = EnglishController;
