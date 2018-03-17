// app/middleware/error_handler.js
module.exports = () => {
    return async function routerControl(ctx, next) {
        let url = ctx.url;
        let aindex = url.indexOf("action");
        if (aindex != -1) {
            let action = url.substring(aindex, url.length);
            let dindex = action.indexOf("=");
            let xindex = action.indexOf(".");
            let router = action.substring(dindex + 1, xindex);
            let inter = action.substring(xindex + 1, action.length);
            ctx.url = "/" + router + "/" + inter + ctx.url;
        }
        
        await next();
    };
};