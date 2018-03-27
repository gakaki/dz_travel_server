const Controller = require('egg').Controller;
const apis = require('../../../apis/travel');
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
        let info = apis.IndexInfo.Init(ctx);
        await this.service.travelService.travelService.selectCity(info);
        info.submit();
    }

    async visit(ctx){
        let info = apis.IndexInfo.Init(ctx);
        await this.service.travelService.travelService.visit(info);
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