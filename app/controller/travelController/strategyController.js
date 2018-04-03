const Controller = require('egg').Controller;
const travelConfig = require("../../../sheets/travel");
const apis = require("../../../apis/travel");


//攻略相关
class StrategyController extends Controller {
    //获取攻略
    async gettravelstrategy(ctx){
        let info = await apis.PostList.Init(ctx,true);
        if(!info.ui){
            return
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

    //获取评论
    async getcomments(ctx){
        let info = await apis.PostComments.Init(ctx,true);
        if(!info.ui){
            return
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
        await ctx.service.travelService.strategyService.getComments(info);
        info.submit();

    }


    //评论
    async sendcomment(ctx){
        let info = await apis.CommentPost.Init(ctx,true);
        if(!info.ui){
            return;
        }
        if(!parseInt(info.score)){
            this.logger.info("非法传参");
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            info.submit();
            return;
        }

        if(parseInt(info.score) > travelConfig.Parameter.Get(travelConfig.Parameter.MAXSCORE)){
            this.logger.info("评分超限 " + info.score);
            info.code = apis.Code.ITEM_MAX;
            info.submit();
            return;
        }
        if(parseInt(info.score) < travelConfig.Parameter.Get(travelConfig.Parameter.MINSCORE)){
            this.logger.info("评分不满足最低值 " + info.score);
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            info.submit();
            return;
        }


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

        if(!info.content){
            this.logger.info("评论内容为空");
            info.code = apis.Code.REQUIREMENT_FAILED;
            info.submit();
            return
        }

        if(info.content.length > travelConfig.Parameter.Get(travelConfig.Parameter.COMMENTWORDLIMIT).value){
            this.logger.info("评论内容字数超限");
            info.code = apis.Code.ITEM_MAX;
            info.submit();
            return
        }

        await ctx.service.travelService.strategyService.sendComment(info);
        info.submit();
    }

    //点赞
    async givethumbsup(ctx){
        let info = await apis.ThumbComment.Init(ctx,true);
        if(!info.ui){
            return
        }

        let comment = await ctx.model.TravelModel.Comment.findOne({comid:info.commentId});
        if(!comment){
            this.logger.info("评论不存在" + info.commentId);
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            info.submit();
            return
        }
        await ctx.service.travelService.strategyService.giveThumbsUp(info);
        info.thumbs = comment.likes +1;
        info.haslike = true;
        info.submit();

    }

}

module.exports = StrategyController;