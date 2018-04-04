const Controller = require('egg').Controller;
const api = require('../../../../apis/travel')

//系统消息、组队通知、事件等
class TravelIOController extends Controller {
    async test(ctx) {
        let testWs = api.TestSend.Init(ctx);
        //read prop by client
        this.logger.info('got ws test msg:', testWs.test);

        //do something....

        //write prop to client
        let res = api.SysMessage.Init(ctx);
        res.mid = 1;
        res.title = 'haha';
        res.content = 'test system message';
        //if failed ,set code
        // res.code = api.Code.FAILED;

        this.logger.info('send ws msg:', res.content)
        res.submit();
    }
}

module.exports = TravelIOController;
