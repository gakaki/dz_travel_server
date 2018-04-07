const Controller    = require('egg').Controller;
const apis          = require("../../../apis/travel");
const travelConfig  = require("../../../sheets/travel");

//观光相关
class TourController extends Controller {

    // 进入游玩界面的请求  哈尔冰游玩例如 游玩首页
    async tourindexinfo(ctx) {

        //首先展示哈尔冰游玩界面的数据
        //用户信息 金币信息 走过的路线图 要新的 是否买了小车
        //游玩场景信息 配置表 去过的和没去过的路线图
        //返回的事件信息接口
        //旅行道具旅行攻略的配置表
        //点击事件才能获得奖励啊

        let info        = apis.TourIndexInfo.Init(ctx);
        let user_info   = ctx.session.ui;
        await this.service.travelService.travelService.fillIndexInfo(info,user_info);
        
        let spots = [
            {
                x:100,
                y:200,
                isStart:true,   //是否起点
                tracked: true,  //是否已经路过
                index: '0'      //经过的顺序
            },
            {
                x:100,
                y:200,
                isStart:true,
                name:'',
                time: parseInt(Date.now()/1000), //经过的时间点
                tracked: true,
                index: '1'
            },
            {
                x:100,
                y:200,
                isStart:true,
                name:'',
                time:null,          //经过的时间点
                tracked: false,     //没经过
                index: -1
            }
        ];
        info.userInfo       = user_info;
        info.spots          = spots;
        info.submit();
    }

    // 开始游玩 选择完毕的行走节点之后点击开始游玩
    async choosespotgo(ctx){
        //所有节点信息
    }

    // 在界面内每隔几分钟获得行走的状态
    async freqstatus(ctx){

    }

    // 修改路线
    async changerouter(ctx) {

    }

    current_timestamp(){
        return parseInt(Date.now()/1000);
    }

    // 前端请求下一个路径点
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