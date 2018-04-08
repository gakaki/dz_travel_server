const Controller    = require('egg').Controller;
const apis          = require("../../../apis/travel");
const travelConfig  = require("../../../sheets/travel");

//观光相关
class TourController extends Controller {

    async tourindexinfo(ctx) {

        let info            = apis.TourIndexInfo.Init(ctx);
        let user_info       = ctx.session.ui;
        await this.service.travelService.travelService.fillIndexInfo(info,user_info);
        await this.service.travelService.tourService.userSpots(info,user_info);
        
        info.submit();
    }



    async choosespotgo(ctx){
        //所有节点信息
        // uid
        // cid
        // spotId[]
    }


    async changerouter(ctx) {

    }

    // 在界面内每隔几分钟获得行走的状态
    async freqstatus(ctx){
        return parseInt(Date.now()/1000);
    }


    // 进入景点
    async enterspot(ctx){
        //返回已经触发的随机事件
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

        let info            = apis.TourPhotography.Init(ctx);
        let user_info       = ctx.session.ui;
        await this.service.travelService.tourService.photography(info,user_info);
        await this.service.travelService.travelService.fillIndexInfo(info,user_info); //消耗50金币
        info.submit();
    }

    // 观光
    async tour(ctx) {
        // 用户到达景点后，跳转至景点界面，可使用观光功能，
        // 观光消耗金币，并会触发随机事件。（事件类型见文档随机事件部分）。
        let info            = apis.TourTour.Init(ctx);
        let user_info       = ctx.session.ui;
        await this.service.travelService.tourService.tour(info,user_info);
        await this.service.travelService.travelService.fillIndexInfo(info,user_info);
        info.submit();
    }

    current_timestamp(){
        return parseInt(Date.now()/1000);
    }

    async nextrouter(ctx) {

        // 给一个spotId景点id  后端计算开始时间 和 spot的景点时间算个差值 返回给前端
        let info        = apis.NextRouter.Init(ctx);
        let user_info   = ctx.session.ui;
        await this.service.travelService.travelService.fillIndexInfo(info,user_info);
        
        let nextSpotConfig  = travelConfig.scenicspots.filter( s => s.cid == parseInt(info.cid) && s.id == parseInt(info.spotId) );

        let row             = await ctx.model.TravelModel.SpotTiming.create({
            sid: ctx.session.sid,
            cid: info.cid,
            spotIdCur:info.spotIdCurrent,    //当前景点id    当前景点等于最后景点了
            spotIdNext:info.spotIdNext,      //目标景点id
            isFinished:false,           //说明这个城市的景点走到顶了
            createDate:this.current_timestamp()      //创建时间 当前景点出发的时间 然后当前时间记
        });

        info.nextSpot = {
            spotIdNext : info.spotIdNext,
            createDate : this.current_timestamp(),
            arrivedDate : 0,
            needTime    : 0,
            elapsedTimeSecond: 0
        }

        info.submit();
    }

    //到达景点
    async reachSpot(ctx){

        let info                = apis.ReachSpot.Init(ctx);
        let user_info           = ctx.session.ui;
        //天气 玩家信息等
        await this.service.travelService.travelService.fillIndexInfo(info,user_info);

        let currentSpotConfig   = travelConfig.scenicspots.filter( s => s.cid == parseInt(info.cid) && s.id == parseInt(info.spotId) );
        let row                 = await ctx.model.TravelModel.SpotTiming.create({
            sid: ctx.session.sid,
            cid: info.cid,
            spotIdCur:info.spotId,      //当前景点id  也就是所谓的到达的景点id
            tracked: true,              //经过此景点了 当然设置为tracked,
            createDate:this.current_timestamp()      //创建时间 当前景点出发的时间 然后当前时间记
        });

        info.nextSpot = {
            spotIdNext : info.spotIdNext,
            createDate : this.current_timestamp(),
            arrivedDate : 0,
            needTime    : 0,
            elapsedTimeSecond: 0
        }

        info.submit();
    }
    // 进入景点观光 触发随机事件
    async questenterspot(ctx) {
        // 1 消耗金币
        this.logger.info("进入景点观光 并触发随机事件");
        let result  = {data:{}};
        let itemId  = 1;    //金币
        let info    = apis.UserInfo.Init(ctx);
        info.submit();
        // info['items']

        if (!_sid) {
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
        result.code = constant.Code.OK;
        if(itemId){
            result.data.stock = ui.items[itemId];
        }else{
            result.data.stock = ui.items;
        }

        ctx.body = result;


        // 2 触发观光的随机事件根据事件类型哦

    }

    // 行程途中随机事件  每隔一分钟定时call 之后获得处理
    async questrandom(ctx) {

    }

    //已触发的随机事件列表？暂时没看到ui 占位
    async questrandomlist(ctx) {

    }

    //玩家完成该城市的经典的具体报告
    async showquestreport(ctx) {

    }

    //用户结束该城市旅游时，会给出用户的效率评分，并根据评分给予金币奖励。
    async leavetour(ctx) {

    }

}

module.exports = TourController;