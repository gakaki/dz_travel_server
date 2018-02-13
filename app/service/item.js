const Service = require('egg').Service;
const utils = require('./../utils/utils');
const configs=require('./../../config/configs');
const crypto = require("crypto");


module.exports =app =>{
    return class ItemService extends Service {
        async itemChange(ui,delta){
            for(let indexs in delta){
                let daddup = delta[indexs] > 0 ?  delta[indexs]  : 0;
                let dcost =  delta[indexs]  > 0 ? 0 : - delta[indexs] ;  // cost统计时按照正数统计
                let index=Number(indexs.replace("items.",""));
                this.logger.info("道具编号 "+index);
                try {
                    let r=await this.ctx.model.UserItemCounter.update({
                        pid: ui.pid, index:index
                    }, {
                        $set: {total: ui.items[index], delta:  delta[indexs]},
                        $inc: {addup: daddup, cost: dcost}
                    }, {upsert: true});
                    this.logger.info("用户道具更新记录 ："+JSON.stringify(r));
                }catch (err){
                    this.logger.error("道具更新失败 ："+err);
                }


            }

            return true;
        }
    }
};

