const nohm      = require('nohm').Nohm;
module.exports  = app => {
    const QuestPool = nohm.model('QuestPool', {
        properties: {
            uid: {
                type: 'string',
            },
            prevtime: {
                type: 'integer',
            },
            events: {
                type: 'json',
                defaultValue: { items: [] },
            }
        },
    });
    return QuestPool;
};


