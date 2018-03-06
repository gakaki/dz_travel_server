module.exports = (apiClazz)=> {
    return (target, name, descriptor) => {
        let fun = descriptor.value;
        let ctx = descriptor.arguments[0];
        let api = new apiClazz;
        api.parse(ctx.query)
        ctx.api = api;
        api.ctx = ctx;
    }
}