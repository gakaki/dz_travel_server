const Service = require('egg').Service;


class ItemService extends Service {
    /**
     *
     * @param uid
     * @param delta  本次操作 对象 一次调用任务是同一个消耗途径
     * @param type   获取/消耗途径
     * @param appName
     * @return {Promise<boolean>}
     */
    async itemChange(uid, delta, type, appName = "travel") {
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
                        type: type,
                        time: new Date(),

                    });

                    this.logger.info(`用户道具 ${index} 更新成功 ${delta[indexs]}`);
                }else{
                    this.logger.error(`道具 ${index} 更新失败, 准备更新的数量 ${delta[indexs]}`);
                    return false;
                }

            } catch (err) {
                this.logger.error("道具更新失败 ：" + err);
                return false;
            }


        }

        return true;
    }

}


module.exports = ItemService;