'use strict';

const Controller = require('egg').Controller;
const constant=require("../../utils/constant");


class englishController extends Controller {
    async ranking(ctx){
        const {_sid,appName}=ctx.query;
        let result={};
        if(!_sid||!appName){
            result.code=constant.Code.PARAMETER_NOT_MATCH;
            ctx.body=result;
            return;
        }
        let ui=await this.service.publicService.user.findUserBySid(_sid);
        if(ui==null){
            result.code=constant.Code.USER_NOT_FOUND;
            ctx.body=result;
            return;
        }
    }
}
module.exports = englishController;
