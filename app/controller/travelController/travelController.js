const Controller = require('egg').Controller;
const apis = require('../../../apis/travel');
const travelConfig = require("../../../sheets/travel");

//旅行出发相关
class TravelController extends Controller {
    async index(ctx) {
        let info = apis.IndexInfo.Init(ctx);
        let ui = await this.ctx.model.PublicModel.User.findOne({uid: info.uid});
        if(!ui){
            info.code = apis.Code.USER_NOT_FOUND;
        }else{
            await this.service.travelService.travelService.fillIndexInfo(info,ui);
        }

        //send data
        info.submit();
    }


    //选择城市
    async selectcity(ctx){
        let info = apis.FlyInfo.Init(ctx);
        let ui = await this.ctx.model.PublicModel.User.findOne({uid: info.uid});
        if(!ui) {
            info.code = apis.Code.USER_NOT_FOUND;
        }else{
            await this.service.travelService.travelService.selectCity(info);
        }

        info.submit();
    }

    async visit(ctx){
        let info = apis.StartGame.Init(ctx);
        let ui = await this.ctx.model.PublicModel.User.findOne({uid: info.uid});
        let fui = await this.ctx.model.PublicModel.User.findOne({uid: info.fid});
        this.logger.info("访问城市");
        //用户不存在
        if(!ui){
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return
        }
        //好友不存在
        if(!fui){
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return
        }
        //金币不足
        if(ui.items[travelConfig.Item.GOLD] <= 0 ){
            info.code = apis.Code.NEED_ITEMS;
            info.submit();
            return
        }
        //城市不存在
        if(!travelConfig.City.Get(info.cid)){
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            info.submit();
            return
        }
        //道具不足
        if(info.type == "11" || info.type == "12"){
            let flyType = info.type.indexOf("2") !=-1 ? 2 :1;
            let tickets = await this.ctx.model.TravelModel.FlyTicket.findOne({uid:ui.uid,isGive:1,flyType:flyType,cid:info.cid});
            if(!tickets || tickets.number ==0 ){
                info.code = apis.Code.NEED_ITEMS;
                info.submit();
                return
            }
        }
        //非法传参
        if(!Number(info.cost)){
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            info.submit();
            return;
        }

        await this.service.travelService.travelService.visit(info,ui);

        info.submit();
    }



    async gotravel(ctx){
        ctx.service.travelService.travelService.goTravel(info);
    }

    async letsgo(ctx){
        ctx.service.travelService.travelService.letsGo(info);
    }

    async gettravellog(ctx){
        let info = apis.TravelLog.Init(ctx);
        let userId = info.uid;
        if(info.playerUid){
            userId = info.playerUid
        }
        let ui = await this.ctx.model.PublicModel.User.findOne({uid: userId});
        if(!ui){
            info.code = apis.Code.USER_NOT_FOUND;
        }else{
            await ctx.service.travelService.travelService.getTravelLog(info,ui);
        }
        info.submit();

    }

}

module.exports = TravelController;