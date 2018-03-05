const Service = require('egg').Service;

const matchPool = {};

class MatchingService extends Service {
    readyMatch(player, appName) {
        matchPool[appName] ? matchPool[appName] : matchPool[appName] = new Set();
        player.readyWait();
        matchPool[appName].add(player);
    }

    mtachFinish(player, appName, roomId) {
        matchPool[appName] ? matchPool[appName] : matchPool[appName] = new Set();
        if (roomId) {
            player.finishReady();
        } else {
            player.gameFinish();
        }
        matchPool[appName].delete(player);
    }

    deleteUser(player, appName) {
         matchPool[appName] ? matchPool[appName] : matchPool[appName] = new Set();
        matchPool[appName].delete(player);
    }

    getTotalPool(appName) {
        return matchPool[appName] ? matchPool[appName] : matchPool[appName] = new Set();
    }
}


module.exports = MatchingService;