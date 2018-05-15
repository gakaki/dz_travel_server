const Controller = require('egg').Controller;

const constant = require("../../utils/constant");


class UserController extends Controller {

    async login(ctx) {
        this.logger.info("我要登陆");

        const { sid, uid, info, appName, shareUid, test } = ctx.query;
        let result = {
            data: {}
        };
        if ( !appName ||(!sid && !uid )) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let userInfo = {};
        if(!info) {
            if(!test || test != "wanghaibo") {
                result.code = constant.Code.PARAMETER_NOT_MATCH;
                ctx.body = result;
                return;
            }
            userInfo = {
                nickName: uid,
            }
        }else{
            try{
                userInfo = JSON.parse(info);
            }catch (e) {
                this.logger.error("登录失败 ", e);
                result.code = constant.Code.LOGIN_FAILED;
                ctx.body = result;
                return;
            }

        }
        let now = new Date();
     //  this.logger.info(`${uid} 本次登录开始时间 ${now}`);
        this.app.getLogger('debugLogger').info(`${uid} 准备开始登录 ${now}`);
        let rs = await this.service.publicService.userService.login(uid, sid, appName, shareUid, userInfo, now.getTime());
    //    ctx.logger.info(rs);
        if (rs.info != null) {
            result.code = 0;
            result.data.info = rs.info;
            result.data.sid = rs.sid;
            result.data.timestamp = Date.now() / 1000;
        } else {
            result.code = constant.Code.LOGIN_FAILED;
        }

        this.app.getLogger('debugLogger').info(`本次登录成功总计耗时 ${Date.now() - now.getTime()} ms`);
        ctx.body = result;
    }

    async getiteminfo(ctx) {
        this.logger.info("我要查询道具");
        let result = {data:{}};
        const {sid, itemId} = ctx.query;
        if (!sid) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(sid);
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

    }



    async changeitem(ctx) {
        const {uid, itemId, count, appName} = ctx.query;
        let result = {};
        if (!uid || !itemId || !count || !appName) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await ctx.model.PublicModel.User.findOne({uid: uid,appName:appName});
        if(!ui){
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        let cost = {
            ["items." + itemId]: Number(count),
        };
       // await ctx.model.PublicModel.User.update({uid: uid, appName: appName}, {$inc: cost});

        let update = await this.service.publicService.itemService.itemChange(ui.uid, cost, "artificial");
        ctx.body = update ? "更新成功" : "更新失败";
    }

    async online(ctx){
        let min             = 10 * 60 * 1000; //10分钟之前的算是不活跃用户 需要发送消息通知
        let ago             = Date.now() - min;
        let users_offline   = await ctx.app.redis.zrangebyscore('online', "-inf", ago );        //这个是当前不活跃的用户 10分钟之前的所有用户标记为离线用户
        let users_online    = await ctx.app.redis.zrangebyscore('online', ago , Date.now() ); //这个是当前活跃用户
        let users_all       = await ctx.app.redis.zrangebyscore('online', "-inf", "+inf" );
        let users_all2      = await ctx.app.redis.zrange('online', "0", "-1" );
        ctx.body        = {
            'online'         : users_online,
            'offline'        : users_offline,
            'all'            : users_all,
            'all2'           : users_all2
        }
        return ctx.body;
    }

}

module.exports = UserController;
