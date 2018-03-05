const Controller = require('egg').Controller;
const constant = require("../../utils/constant");
const englishConfigs = require("../../../sheets/english");

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

    async updateposition(ctx){
        const {_sid, appName,position} = ctx.query;
        let result = {};
        if (!_sid || !appName || !position) {
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
        let user=await this.service.englishService.englishService.updatePosition(ui,appName,position);
        result.code=constant.Code.OK;
        result.data=user;
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
        ctx.logger.info("养成系统");
        let dev=await this.service.englishService.englishService.develop(ui,appName);
        result.code=constant.Code.OK;
        result.data=dev;
        ctx.body=result;
    }

    async speechlevelup(ctx){
        const {_sid, appName,spid} = ctx.query;
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
        if(ui.character.developSystem[spid].level==englishConfigs.Speech.Get(spid).endlevel){
            result.code=constant.Code.LEVEL_MAX;
            ctx.body=result;
            return;
        }
        let r=await this.service.englishService.englishService.speechLevelUp(ui,spid,appName);
        result.code=constant.Code.OK;
        result.data=r;
        ctx.body=result;
    }




    async getfriendrankinglist(ctx){
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
        let friendList=await this.service.englishService.englishService.getFriendRankingList(ui,appName);
        result.code=constant.Code.OK;
        result.data=friendList;
        ctx.body=result;
    }


    async getworldrankinglist(ctx){
        const {_sid, appName,season} = ctx.query;
        let result = {};
        if (!_sid || !appName || !season) {
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
        let worldList=await this.service.englishService.englishService.getWorldRankingList(appName,season);
        if(worldList !=null){
            result.code=constant.Code.OK;
            result.data=worldList;
        }else{
            result.code=constant.Code.REQUIRED_LOST;
        }

        ctx.body=result;
    }



}

module.exports = EnglishController;
