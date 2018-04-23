const Service = require('egg').Service;


class ItemService extends Service {
    async itemChange(uid, delta, appName = "travel") {
        for (let indexs in delta) {
            let daddup = delta[indexs] > 0 ? delta[indexs] : 0;
            let dcost = delta[indexs] > 0 ? 0 : -delta[indexs]; // cost统计时按照正数统计
            let index = indexs.replace("items.", "");
            try {
                let update = delta[indexs] < 0 ?
                    await this.ctx.model.PublicModel.User.update({ uid: uid, [indexs]: { $gte: dcost } }, { $inc: { [indexs]: delta[indexs] } }) :
                    await this.ctx.model.PublicModel.User.update({ uid: uid }, { $inc: { [indexs]: delta[indexs] } });
                this.logger.info(update);
                if(update.nModified) {
                    await this.ctx.model.PublicModel.UserItemCounter.update({
                        uid: uid, index: index, appName: appName }, {
                        $set: { delta: delta[indexs] },
                        $inc: { total: delta[indexs], addup: daddup, cost: dcost } }, { upsert: true });

                    await this.ctx.model.PublicModel.ItemRecord.create({
                        uid: uid,
                        index: index,
                        appName: appName,
                        delta: delta[indexs],
                        time: new Date(),

                    });

                    this.logger.info(`用户道具 ${index} 更新成功 ${delta[indexs]}`);
                }else{
                    this.logger.error(`道具 ${index} 更新失败, 准备更新的数量 ${delta[indexs]}`);
                }

            } catch (err) {
                this.logger.error("道具更新失败 ：" + err);
            }


        }

        return true;
    }


    async itemUse(ui, delta, appMame="travel") {
        //特产的使用
        return true;
    }
}


module.exports = ItemService;