// app/middleware/error_handler.js

// 记录用户是否在线的中间件
// 主要使用redis 的 zset 排序 特性来 记录用户是否在线 非百分百socket实现的实时
const KEY_USER_ONLINE = `online`;

module.exports = () => {
    return async function routerGlobalUserOnlineRecord(ctx, next) {

        //playloop freshspots partnerinfo 跳过3个action
        let url           = ctx.url;
        let aindex        = url.indexOf("action");
        if (aindex != -1) {
            let action    = url.substring(aindex, url.length);
            let dindex    = action.indexOf("=");
            let xindex    = action.indexOf(".");
            let router    = action.substring(dindex + 1, xindex);
            let inter     = action.substring(xindex + 1, action.length);
            if (inter == "playloop" || inter == "freshspots" || inter == "partnerinfo" || inter == "auth"){
                await next();
            }else{
                let uid         = ctx.query['uid'];
                if (!uid) {
                    await next();
                }else{
                    try{
                        await ctx.app.redis.zadd( KEY_USER_ONLINE , Date.now() ,  uid );
                    }catch(e){
                        console.log(e);
                    }
                    await next();
                }
            }
        }

    };
};