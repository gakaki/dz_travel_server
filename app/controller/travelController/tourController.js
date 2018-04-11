const Controller        = require('egg').Controller;
const apis              = require("../../../apis/travel");
const travelConfig      = require("../../../sheets/travel");
const ScenicPos = require('../../../sheets/scenicpos');
const utilTime          = require("../../utils/time");


let tour = new Map();
let userLines = new Map();

//观光相关
class TourController extends Controller {
    // 查询用户是否需要新手引导
    async checkguide(ctx){
        let info            = apis.CheckGuide.Init(ctx);
        let user            = await this.ctx.model.PublicModel.User.findOne({uid: ctx.query.uid });
        info.hasPlay        = user['hasPlay'] ? true : false;
        info.submit();
    }
    //前端新手引导 标记一下已经完成新手引导了
    async finishguide(ctx){
        let info            = apis.FinishGuide.Init(ctx);
        await this.ctx.model.PublicModel.User.update({uid: ctx.query.uid }, {$set: {hasPlay: info.play}});
        info.submit();
    }

    async tourindexinfo(ctx) {
        this.logger.info("进来了");
        this.logger.info(ctx.query);
        let cid = 1;
        let city = travelConfig.City.Get(cid);
        let lines = userLines.get(ctx.query.uid);
        if(ctx.query.line){
            lines = JSON.parse(ctx.query.line);
            userLines.set(ctx.query.uid,lines);
        }

        if(!tour.get(ctx.query.uid)){
            let result ={
                code : "0",
                data:{
                    task: {
                        'spot': [0, 6],
                        'tour': [0, 2],
                        'photo': [0, 2]
                    },
                    spots: city.scenicspot.map((s, idx) => {
                        let o = {};
                        let cfg = travelConfig.Scenicspot.Get(s);
                        let xy = ScenicPos.Get(s);
                        o.id = s;
                        o.cid = cid;
                        o.name = cfg.scenicspot;
                        o.building = cfg.building;
                        o.x = xy.x;
                        o.y = xy.y;
                        o.tracked = false;

                        if(lines){
                            let index = lines.findIndex((n) => n == s);
                            o.index = index;
                            if(index != -1){
                                o.createDate = new Date().getTime() + (index+1) * 10000;
                            }
                        }else{
                            o.index = -1;// 真实情况，应该读库
                        }



                        return o;
                    }),
                    weather: 1,
                },

            };
            if(lines){
                tour.set(ctx.query.uid,result);
            }

            ctx.body =result;
        }else{
            let result = tour.get(ctx.query.uid);
            let sps = result.data.spots;
         //   this.logger.info(sps);
            result.data.spots=sps.map((s, idx) =>{
                let o = s;
                if(o.index != -1){
                    this.logger.info(o.createDate);
                    let date = new Date().getTime();
                    this.logger.info(date);
                    if(o.createDate < date) {
                        o.tracked = true;
                    }
                }
                this.logger.info(o);
                return o;
            });
          //  this.logger.info( result.data.spots);
            ctx.body =result
        }




        return;

        let info            = apis.TourIndexInfo.Init(ctx);
        let user_info       = ctx.session.ui;
        await this.service.travelService.tourService.tourindexinfo(info,user_info);
        info.firstPlay      = user_info.firstPlay;
        info.submit();
    }

    async tourstart(ctx){


        let cid = 1;
        let city = travelConfig.City.Get(cid);
        let result ={
            code : "0",
            data:{
                task: {
                    'spot': [0, 6],
                    'tour': [0, 2],
                    'photo': [0, 2]
                },
                spots: city.scenicspot.map((s, idx) => {
                    let o = {};
                    let cfg = travelConfig.Scenicspot.Get(s);
                    let xy = ScenicPos.Get(s);
                    o.id = s;
                    o.cid = cid;
                    o.name = cfg.scenicspot;
                    o.building = cfg.building;
                    o.x = xy.x;
                    o.y = xy.y;
                    o.tracked = false;
                    o.index = lines.findIndex((n) => n == s);
                    o.createDate = new Date().getTime() + idx * 10000;
                    return o;
                }),
                weather: 1,
            },

        };

        ctx.body =result;
    }
    
    async changerouter(ctx) {

    }

    // 拍照
    async photography(ctx) {
        /*
            用户到达景点后，可使用拍照功能，每个城市拍照有次数限制，购买单反相机可增加拍照次数，
            拍照时会获得一张该景点明信片，如果是双人旅行，则留下2人头像。
            如果不好实现，则头像改为签名。
            每个景点仅可拍照一次。
            部分明信片需要在特定季节获得。
        */
        let info            = apis.Photography.Init(ctx);
        let user_info       = ctx.session.ui;
        await this.service.travelService.tourService.photography(info,user_info);
        info.submit();
    }

    // 观光
    async tourspot(ctx) {
        // 用户到达景点后，跳转至景点界面，可使用观光功能，
        // 观光消耗金币，并会触发随机事件。（事件类型见文档随机事件部分）。
        let info            = apis.TourTour.Init(ctx);
        let user_info       = ctx.session.ui;
        await this.service.travelService.tourService.spotTour(info,user_info);
        await this.service.travelService.travelService.fillIndexInfo(info,user_info);
        info.submit();
    }

    // 随机事件问答题答案提交
    async tourspotanswer(ctx){
        // id   db_id
        // eid  event id
        // answer 答案
        let info            = apis.TourSpotAnswer.Init(ctx);
        await this.ctx.service.travelService.tourService.tourspotanswer(info);
        let user_info       = ctx.session.ui;
        await this.service.travelService.travelService.fillIndexInfo(info,user_info);
        info.submit();
    }
    //点开显示随机事件
    async eventshow(ctx){
        let info            = apis.EventShow.Init(ctx);
        await this.ctx.service.travelService.tourService.eventshow(info);
        let user_info       = ctx.session.ui;
        await this.service.travelService.travelService.fillIndexInfo(info,user_info);
        info.submit();
    }

    // 进入景点
    async enterspot(ctx) {
        this.logger.info("进入景点观光");
        let info                    = apis.Enterspot.Init(ctx);
        await this.service.questService.questService.enterspot(info);
        info.submit();
    }

    // 行程途中访问是否有随机事件
    async questrandom(ctx) {

    }

    //玩家完成该城市的经典的具体报告
    async showquestreport(ctx) {

    }

    //用户结束该城市旅游时，会给出用户的效率评分，并根据评分给予金币奖励。
    async leavetour(ctx) {

    }

}

module.exports = TourController;