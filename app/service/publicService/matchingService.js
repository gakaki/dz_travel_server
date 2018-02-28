const Service = require('egg').Service;

const matchPool = {};

class MatchingService extends Service {
    readyMatch(player, appName) {
        let totalPool = matchPool[appName] ? matchPool[appName] : matchPool[appName] = new Set();
        player.readyWait();
        totalPool.add(player);
    }

    mtachFinish(player, appName, roomId) {
        let totalPool = matchPool[appName] ? matchPool[appName] : matchPool[appName] = new Set();
        if (roomId) {
            player.finishReady(roomId);
        } else {
            player.gameFinish();
        }
        totalPool.delete(player);
    }

    deleteUser(player, appName) {
        let totalPool = matchPool[appName] ? matchPool[appName] : matchPool[appName] = new Set();
        totalPool.delete(player);
    }

    getTotalPool(appName) {
        return matchPool[appName] ? matchPool[appName] : matchPool[appName] = new Set();
    }
}


module.exports = MatchingService;