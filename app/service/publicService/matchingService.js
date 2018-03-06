const Service = require('egg').Service;

const matchPool = {};

class MatchingService extends Service {
    readyMatch(player, appName) {
        if(!matchPool[appName]){
            matchPool[appName] = new Set();
        }
        player.readyWait();
        console.log("当前匹配池数量："+matchPool[appName].size);

        matchPool[appName].add(player);
        console.log(player.user.uid);
        /* matchPool[appName] ? matchPool[appName] : matchPool[appName] = new Set();
         player.readyWait();
         matchPool[appName].add(player);*/
    }

    mtachFinish(player, appName, roomId) {
        console.log("matchser: 匹配结束");
        if(!matchPool[appName]){
            matchPool[appName] = new Set();
        }
      //  matchPool.has(appName) ? matchPool.get(appName) : matchPool.set(appName,new Set());
        if (roomId) {
            player.finishReady();
        } else {
            player.gameFinish();
        }
        matchPool[appName].delete(player);
    }

    deleteUser(player, appName) {
        console.log("掉线了。。。。。");
        return
        if(!matchPool[appName]){
            console.log("111111");
            matchPool[appName] = new Set();
        }
        matchPool[appName].delete(player);
    }

    getTotalPool(appName) {
        if(!matchPool[appName]){
            matchPool[appName] = new Set();
        }
        return matchPool[appName]
    }
}


module.exports = MatchingService;