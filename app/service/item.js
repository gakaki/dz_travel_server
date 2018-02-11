const Service = require('egg').Service;
const utils = require('./../utils/utils');
const configs=require('./../../config/configs');
const crypto = require("crypto");


module.exports =app =>{
    return class ItemService extends Service {
        itemChange(ui,delta){
            for(let index in delta){
                let daddup = delta[index] > 0 ?  delta[index]  : 0;
                let dcost =  delta[index]  > 0 ? 0 : - delta[index] ;  // cost统计时按照正数统计
                this.ctx.model.UserItemCounter.update({
                    pid: ui.pid, index:index
                }, {
                    $set: {total: ui.items[index], delta:  delta[index]},
                    $inc: {addup: daddup, cost: dcost}
                }, {upsert: true})
            }
        }
    }
};

