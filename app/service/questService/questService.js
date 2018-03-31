const QuestRepoInstance = require("./QuestRepo");

const Service = require('egg').Service;
const season = require('date-season')({north: true, autumn: true});
const holiday = require('holiday.cn').default;
const utils = require("../../utils/utils");

class QuestService extends Service{
    async getEvent(row_id) {
        const row       =  QuestRepoInstance.find(row_id);
        this.logger.info(row.length);
        // this.logger.info('event_rows1', row);
        return row;
    }

}


module.exports = QuestService;