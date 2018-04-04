const Controller    = require('egg').Controller;
const apis          = require("../../../apis/travel");
//观光相关
class TourController extends Controller {

    // 进入游玩界面的请求  哈尔冰游玩例如 游玩首页
    async tourIndexInfo(ctx) {

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
    // 修改路线
    async changeRouter(ctx) {

    }

    // 前端请求下一个路径点
    async nextRouter(ctx) {
        // 给一个spotId景点id  后端计算开始时间 和 spot的景点时间算个差值 返回给前端 然后下次请求回来的时候要保存当时那个开始时间

    }

    // 进入景点观光 触发随机事件
    async questEnterSpot(ctx) {
        // 1 消耗金币
        this.logger.info("进入景点观光 并触发随机事件");
        let result  = {data:{}};
        let itemId  = 1;    //金币
        let info    = apis.UserInfo.Init(ctx);
        info.submit();
        info['items']

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
    async questRandom(ctx) {

    }

    //已触发的随机事件列表？暂时没看到ui 占位
    async questRandomList(ctx) {

    }

    //玩家完成该城市的经典的具体报告
    async showQuestReport(ctx) {

    }

    //用户结束该城市旅游时，会给出用户的效率评分，并根据评分给予金币奖励。
    async leaveTour(ctx) {

    }

}

module.exports = TourController;