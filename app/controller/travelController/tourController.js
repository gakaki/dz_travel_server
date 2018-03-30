const Controller = require('egg').Controller;

//观光相关
class TourController extends Controller {

    // 修改路线
    async change_router(ctx) {

    }

    // 随机事件获得奖励
    async get_award(ctx) {


    }
    // 哈尔冰游玩例如 游玩首页
    async index(ctx) {

        //首先展示哈尔冰游玩界面的数据
        //用户信息 金币信息 走过的路线图 要新的 是否买了小车
        //游玩场景信息 配置表 去过的和没去过的路线图
        //返回的事件信息接口
        //旅行道具旅行攻略的配置表
        //点击事件才能获得奖励啊


        let info = apis.IndexInfo.Init(ctx);
        let ui = ctx.service.publicService.userService.findUserBySid(info.sid);
        if(!ui){
            info.code = apis.Code.USER_NOT_FOUND;
            info.submit();
            return;
        }

        await this.service.travelService.travelService.fillIndexInfo(info,ui);

        //send data
        info.submit();
    }
}

module.exports = TourController;