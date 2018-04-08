//攻略相关数据逻辑
const Service = require('egg').Service;
const travelConfig = require('../../../sheets/travel');
const apis = require('../../../apis/travel');

class StrategyService extends Service {
   async getTravelStrategy(info){
       let page = info.page ? Number(info.page) : 1;
       let limit = info.limit ? Number(info.limit) : travelConfig.Parameter.Get(travelConfig.Parameter.COUNTLIMIT).value;
       let tsinfos = await this.ctx.model.TravelModel.Comment.aggregate([
           {$match:{cid:info.cityId,type:Number(info.type)}},
           {$group:{_id:{travel_tips:"$travel_tips"},score:{$sum:"$grade"},commentNum:{$sum:1}}},
           {$project:{_id:0,travel_tip:"$_id.travel_tips",totalScore:"$score",commentNum:"$commentNum"}}
       ]);
       let tsMap=new Map();
       let travel_tips = new Set(tsinfos.map(value => {
           tsMap.set(Number(value.travel_tip),value);
          return Number(value.travel_tip)
       }));

       this.logger.info(tsinfos);
       let posts = [];
       let travelTips = [];
       if(info.type == apis.PostType.JINGDIAN){
            travelTips = (travelConfig.City.Get(info.cityId).scenicspot).slice((page-1)*limit,page*limit);
       }else if(info.type == apis.PostType.TECHAN){
            travelTips = (travelConfig.City.Get(info.cityId).speciality).slice((page-1)*limit,page*limit);
       }
       //景点图片url 未配置
       for(let travel_tip of travelTips){
           let tsinfo = {
               cityId : info.cityId,
               postId : travel_tip,
               type :info.type,
               score :travel_tips.has(travel_tip)?(tsMap.get(travel_tip).totalScore / tsMap.get(travel_tip).commentNum).toFixed(1):"0.0",
               commentNum :travel_tips.has(travel_tip)?tsMap.get(travel_tip).commentNum:0,
           };
           if(info.type == apis.PostType.JINGDIAN){
               tsinfo.content = travelConfig.Scenicspot.Get(travel_tip).description;
               tsinfo.name = travelConfig.Scenicspot.Get(travel_tip).scenicspot;

           } else if(info.type == apis.PostType.TECHAN){
               tsinfo.name =travelConfig.Speciality.Get(travel_tip).specialityname;
               tsinfo.img =travelConfig.Speciality.Get(travel_tip).picture;
           }
           posts.push(tsinfo);
       }
       info.posts = posts;
   }


   async getComments(info){
       let page = info.page ? Number(info.page) : 1;
       let limit = info.limit ? Number(info.limit) : travelConfig.Parameter.Get(travelConfig.Parameter.COUNTLIMIT).value;
       let comments = await this.ctx.model.TravelModel.Comment.find({cid:info.cityId,type:Number(info.type),travel_tips:info.postId}).sort("-likes").skip((page-1)*limit).limit(limit);
       let outcomments = [];
       //景点图片url 未配置
       if(info.type == apis.PostType.JINGDIAN){
           info.content = travelConfig.Scenicspot.Get(info.postId).description;
           info.name = travelConfig.Scenicspot.Get(info.postId).scenicspot;
       }else if(info.type == apis.PostType.TECHAN){
           info.name =travelConfig.Speciality.Get(info.postId).specialityname;
           info.img =travelConfig.Speciality.Get(info.postId).picture;
       }

       for(let comment of comments){
           let outcomment = {
            commentId:comment.comid,//评论id
            content:comment.context,//评论内容
            score:comment.grade,//评论得分
            thumbs:comment.likes,//点赞数
            time:comment.createDate.format("yyyy-MM-dd")//创建时间
           };
           let user = await this.ctx.model.PublicModel.User.findOne({uid:comment.uid});
           let like = await this.ctx.model.TravelModel.LikeRecord.findOne({uid:info.ui.uid,comid:comment.comid});
           outcomment.haslike = !!like;
           outcomment.user={
               uid:user.uid,
               nickName:user.nickName,
               avatarUrl:user.avatarUrl,
           };
           outcomments.push(outcomment);
       }

       info.comments=outcomments;
   }

   async sendComment(info){
       let comid ="com"+new Date().getTime();
       let date =new Date();

       let context = info.content;
       //替换屏蔽字

       let masks =travelConfig.maskwords;
       let maskList = [];
       for(let mas of masks){
           maskList.push(mas.maskword);
       }
       for(let key of maskList){
           this.logger.info(key);
           context=context.replace(key,"*");
       }


       this.logger.info(context);

       let shielded = false;
       if(context.indexOf("*") != -1){
           shielded = true
       }

       await this.ctx.model.TravelModel.Comment.create({
           uid:info.ui.uid,
           cid:info.cityId,
           type:Number(info.type),//1 攻略 2 特产
           travel_tips:info.postId, //攻略特产id
           comid:comid, //评论id
           context:context, //内容
           grade:info.score,  //打分
           hasMaskWord:shielded,
           createDate:date,
       });
       info.comments = {
            user:{
                uid:info.ui.uid,
                nickName:info.ui.nickName,
                avatarUrl:info.ui.avatarUrl
            },
            commentId:comid,//评论id
            content:context,//评论内容
            score:info.score,//评论得分
            thumbs:0,//点赞数
            haslike: false,
            time:date.format("yyyy-MM-dd")//创建时间
       }
   }


   async giveThumbsUp(info,comment){
       //评论点赞 + 1
       await this.ctx.model.TravelModel.Comment.update({comid:info.commentId},{$inc:{likes:1}});
       //更新点赞表
       await this.ctx.model.TravelModel.LikeRecord.update({uid:info.ui.uid, comid:info.commentId},
           {uid:info.ui.uid, comid:info.commentId,createDate:new Date()},
           {upsert:true}
           );

       //被点赞的人获得金币
       this.ctx.service.publicService.itemService.itemChange(info.ui,{["items."+travelConfig.Item.GOLD]:travelConfig.Parameter.Get(travelConfig.Parameter.THUMBUPGOLD).value});


       //通知被赞人
       let type = comment.type;
       let id = comment.travel_tips;
       let context = travelConfig.Message.Get(travelConfig.Message.LIKESMESSAGE).content;
       let content = "";
       if(type == apis.PostType.JINGDIAN){
           let scenicspot = travelConfig.Scenicspot.Get(id).scenicspot;
           content = context.replace("s%",scenicspot);
       }
       if(type == apis.PostType.TECHAN){
           let specialityname = travelConfig.Speciality.Get(id).specialityname;
           content = context.replace("s%",specialityname);
       }
       await this.ctx.model.TravelModel.UserMsg.create({
           uid:comment.uid,
           mid:"msg"+travelConfig.Message.LIKESMESSAGE+new Date().getTime(),
           type:travelConfig.Message.LIKESMESSAGE,
           title:travelConfig.Message.Get(travelConfig.Message.LIKESMESSAGE).topic,
           content:content,
           date:new Date()
       })

   }
}

module.exports = StrategyService;