const constant = require("../../utils/constant");
const englishConfigs = require("../../../sheets/english");
module.exports = {
    schedule: {
        cron: '0 30 0 1 * *',      //秒(0-59)，分(0-59)，时(0-23)，日(1-31)，月(1-12)，周(0-7,0和7代表周日)
        type: 'worker', // all 指定所有的 worker 都需要执行
    },
    async task(ctx) {
        ctx.logger.info("赛季结束了");
        let list = await ctx.model.PublicModel.User.find({appName:constant.AppName.ENGLISH});
        let season = ctx.service.englishService.englishService.getSeason();
        ctx.logger.info("当前赛季"+season);
        let lastSeason = season-1;
        for(let player of list){
            ctx.logger.info(player.character.season[lastSeason]);
            if(player.character.season[lastSeason]){
                let rank = player.character.season[lastSeason].rank;
                let award = englishConfigs.Stage.Get(rank).award;
                let itemId = award.k;
                let num = Number(award.v);
                let cost = {
                    ["items."+itemId]:num
                };
                await ctx.model.PublicModel.User.update({uid:player.uid,appName:constant.AppName.ENGLISH},{$inc:cost});
                let ui = await ctx.model.PublicModel.User.findOne({uid:player.uid,appName:constant.AppName.ENGLISH});
                ctx.service.publicService.itemService.itemChange(ui, cost, constant.AppName.ENGLISH);
            }
        }
    },
};