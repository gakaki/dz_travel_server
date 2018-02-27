const utils =require("../../utils/utils");

const Service = require('egg').Service;

const matchPool={};

module.exports =app =>{
    return class MatchingService extends Service {
         readyMatch(player,appName){
            let totalPool=matchPool[appName] ?matchPool[appName]:matchPool[appName]=new Set();
            player.readyWait();
            totalPool.add(player);
        }
        mtachFinish(player,appName,roomId){
            let totalPool=matchPool[appName] ?matchPool[appName]:matchPool[appName]=new Set();
            if(roomId){
                player.finishReady(roomId);
            }
            totalPool.delete(player);
        }

        getTotalPool(appName){
            return matchPool[appName] ?matchPool[appName]:matchPool[appName]=new Set();
        }
    }
};

