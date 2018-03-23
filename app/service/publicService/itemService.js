const Service = require('egg').Service;


class ItemService extends Service {
    async itemChange(ui, delta, appMame) {
        for (let indexs in delta) {
            let daddup = delta[indexs] > 0 ? delta[indexs] : 0;
            let dcost = delta[indexs] > 0 ? 0 : -delta[indexs];  // cost统计时按照正数统计
            let index = indexs.replace("items.", "");
            try {
                let r = await this.ctx.model.PublicModel.UserItemCounter.update({
                    pid: ui.pid, index: index, appName: appMame
                }, {
                    $set: {total: ui.items[index], delta: delta[indexs]},
                    $inc: {addup: daddup, cost: dcost}
                }, {upsert: true});

                await this.ctx.model.PublicModel.ItemRecord.create({
                    pid: ui.pid,
                    index: index,
                    appName: appMame,
                    delta: delta[indexs],
                    time: new Date().toLocaleString(),

                });

                this.logger.info("用户道具 " + index +" 更新记录 ：" + JSON.stringify(r));
            } catch (err) {
                this.logger.error("道具更新失败 ：" + err);
            }


        }

        return true;
    }
}


module.exports = ItemService;