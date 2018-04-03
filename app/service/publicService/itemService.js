const Service = require('egg').Service;


class ItemService extends Service {
    async itemChange(ui, delta, appMame="travel") {
        for (let indexs in delta) {
            let daddup = delta[indexs] > 0 ? delta[indexs] : 0;
            let dcost = delta[indexs] > 0 ? 0 : -delta[indexs];  // cost统计时按照正数统计
            let index = indexs.replace("items.", "");
            try {
                let update = delta[indexs] > 0 ?
                    await this.ctx.model.PublicModel.User.update({uid:ui.uid,[indexs] : {$gte: 0}},{$inc:{[indexs]:delta[indexs]}}):
                    await this.ctx.model.PublicModel.User.update({uid:ui.uid,[indexs] : {$gt: 0}},{$inc:{[indexs]:delta[indexs]}});
                if(update.nModified){
                    let r = await this.ctx.model.PublicModel.UserItemCounter.update({
                        pid: ui.pid, index: index, appName: appMame
                    }, {
                        $set: {delta: delta[indexs]},
                        $inc: {total: delta[indexs] ,addup: daddup, cost: dcost}
                    }, {upsert: true});

                    await this.ctx.model.PublicModel.ItemRecord.create({
                        pid: ui.pid,
                        index: index,
                        appName: appMame,
                        delta: delta[indexs],
                        time: new Date(),

                    });

                    this.logger.info("用户道具 " + index +" 更新记录 ：" + JSON.stringify(r));
                }else{
                    this.logger.error("道具 "+index+" 更新失败 ，用户当前数量"+ui[indexs]+" , 准备更新的数量 "+ delta[indexs]);
                }

            } catch (err) {
                this.logger.error("道具更新失败 ：" + err);
            }


        }

        return true;
    }
}


module.exports = ItemService;