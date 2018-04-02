const Controller = require('egg').Controller;
const travelConfig = require("../../../sheets/travel");
const apis = require("../../../apis/travel");


//攻略相关
class StrategyController extends Controller {
    async gettravelstrategy(ctx){
        let info = apis.PostList.Init(ctx);
   //     this.logger.info(info);
        let ui = await ctx.service.publicService.userService.findUserBySid(info.sid);
        if(!ui){
            this.logger.info("用户不存在");
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }
        //城市不存在
        if(!travelConfig.City.Get(info.cityId)){
            this.logger.info("城市不存在");
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            info.submit();
            return
        }
        if(info.type != apis.PostType.JINGDIAN && info.type != apis.PostType.TECHAN){
            this.logger.info("没有的类型" + info.type);
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            info.submit();
            return
        }
        await ctx.service.travelService.strategyService.getTravelStrategy(info);
        info.submit();
    }


    async getcomments(ctx){
        let info = apis.PostComments.Init(ctx);
        // let ui = await ctx.service.publicService.userService.findUserBySid(info.sid);
        // if(!ui){
        //     this.logger.info("用户不存在");
        //     info.code = apis.Code.USER_NOT_FOUND;
        //     info.submit();
        //     return;
        // }

        let ui = await ctx.model.PublicModel.User.findOne({uid:info.uid});
        //城市不存在
        if(!travelConfig.City.Get(info.cityId)){
            this.logger.info("城市不存在");
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            info.submit();
            return
        }
        if(info.type != apis.PostType.JINGDIAN && info.type != apis.PostType.TECHAN){
            this.logger.info("没有的类型" + info.type);
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            info.submit();
            return
        }

        if(info.type == apis.PostType.JINGDIAN){
            if(!travelConfig.Scenicspot.Get(info.postId)){
                this.logger.info("景点不存在" + info.postId);
                info.code = apis.Code.PARAMETER_NOT_MATCH;
                info.submit();
                return
            }
        }else if(info.type == apis.PostType.TECHAN){
            if(!travelConfig.Speciality.Get(info.postId)){
                this.logger.info("特产不存在" + info.postId);
                info.code = apis.Code.PARAMETER_NOT_MATCH;
                info.submit();
                return
            }
        }
        await ctx.service.travelService.strategyService.getComments(info,ui);
        info.submit();

    }
}

module.exports = StrategyController;