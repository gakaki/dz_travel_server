const apis            = require("../../../apis/travel");
const Controller      = require('egg').Controller;
const constant        = require("../../utils/constant");
const travelConfig    = require("../../../sheets/travel");
const QuestLoop       = require("../../service/questService/questLoop");
const QuestPool       = require("../../service/questService/questPool");
const time            = require("../../utils/time");

class TestController extends Controller {

    async hello(ctx){
        return ctx.body = {
            'hello' : 'world'
        }
    }

    async testnohm(ctx){
        // 行程途中访问是否有随机事件 这是一个轮询接口 用来访问任务的随机事件的
            try{
                const questPool     = this.app.nohmModel.questPool;
                const ps            = new questPool();

                let uid             = "abc";

                ps.p({
                    id : uid,
                    uid : uid,
                    prevtime         : 12312313
                });

                await ps.save$();
                const data          = await questPool.load(ps.uid);
                console.log(data);
                return ctx.body = data;
                // await questPool.remove$(ps.id);
            }catch(e){
                console.log(e);
            }

            // info.submit();
    }
    //起飞
    async testfly(ctx) {
        let info = apis.TestStartGame.Init(ctx);
        let currentCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: info.uid });
        let ui = await this.ctx.model.PublicModel.User.findOne({ uid: info.uid });
        if(!ui) {
            info.code = apis.Code.USER_NOT_FOUND;
            return;
        }
        await this.service.travelService.travelService.visit(info, ui, currentCity, null);
        info.submit();
    }


    async testtourindex(ctx) {
        let info = apis.TestTourIndexInfo.Init(ctx);
        let ui = await this.ctx.model.PublicModel.User.findOne({ uid: info.uid });
        await this.service.travelService.tourService.tourindexinfo(info, ui);
        info.submit();
    }
    async testsetroute(ctx) {
        let info = apis.TestSetRouter.Init(ctx);
        let cfg = travelConfig.City.Get(info.cid);
        if(!cfg) {
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            return;
        }
        info.line = JSON.stringify(cfg.scenicspot);
        let ui = await this.ctx.model.PublicModel.User.findOne({ uid: info.uid });
        await this.service.travelService.tourService.setrouter(info, ui);
        info.submit();
    }

    async testplayloop(ctx) {
        let info = apis.TestPlayLoop.Init(ctx);
        await this.ctx.service.travelService.tourService.playloop(info);
        info.submit();
    }

    async testfreshspots(ctx) {
        let info = apis.TestFreshSpots.Init(ctx);
        await this.service.travelService.tourService.freshspots(info);
        info.submit();
    }

    async testquestpop(ctx){
        this.app.getLogger('debugLogger').info(" [testquestpop] ","》》》》》》》》》》》testquestpop");
        let uid            = 123456;
        let cid            = 3;
        let spotId         = 11211;
        let isEventShow    = true;
        let qp             = new QuestLoop(this.app,isEventShow ,uid,cid);
        qp.init();
        let res           = await qp.popEventThanGetFormat();
        return ctx.body   = res;
    }

    //测试新版事件生成
    async testquestloop(ctx) {
        this.app.getLogger('debugLogger').info(" [testquestloop] ","》》》》》》》》》》》testquestloop");
        let uid              = 123456;
        let cid              = 3;
        let spotId           = 11211;
        let isEventShow      = false;
        let qp               = new QuestLoop(this.app, isEventShow ,uid,cid);

        qp.clear();
        // qp.pause();
        // qp.resume();
        // let prevEvents       = qp.getEvents();
        await qp.init();
        await qp.randomForDebugByCount(10);
        let res           = await qp.getFormat();
        return ctx.body   = res;
    };

    async testquestloopclear(ctx) {
        this.app.getLogger('debugLogger').info(" [testquestloopclear] ","》》》》》》》》》》》testquestloopclear");
        let uid              = 123456;
        let cid              = 3;
        let spotId           = 11211;
        let isEventShow      = false;
        let qp               = new QuestLoop(this.app, isEventShow ,uid,cid);
        qp.clear();
        let res              = await qp.getFormat();
        return ctx.body      = res;
    };
    async testquestloopstepaddevent(ctx) {
        this.app.getLogger('debugLogger').info(" [testquestloopstepaddevent] ","》》》》》》》》》》》testquestloopstepaddevent");
        let uid              = 123456;
        let cid              = 3;
        let spotId           = 11211;
        let isEventShow      = false;
        let qp               = new QuestLoop(this.app, isEventShow ,uid,cid);
        let prevEvents       = [];
        await qp.init();
        let res              = await qp.getFormat();
        return ctx.body      = res;
    };


    //测试事件pool
    async testquestpool(ctx) {
        const QuestPool = require("./questPool");

// // var users = [
// //     { 'user': 'fred',   'age': 48 },
// //     { 'user': 'barney', 'age': 36 },
// //     { 'user': 'fred',   'age': 42 },
// //     { 'user': 'barney', 'age': 34 }
// // ];
// // users = users.sort( (a,b) => {
// //     return a.age < b.age;
// // });
// //
// // console.log(users);
// // console.log(_.ceil(_.random(1, 5, true), 2))
// // return;
//
// // 100次测试生成抽奖的概率计算查看 上海的
        let objParametes   = {
            cid:3,
            weather: 0,
            today: 0,
            itemSpecial: 0
        }
        console.time('test 事件生成');
        for ( let i = 0 ; i < 10 ; i++){
            let er              = new QuestPool(objParametes);
            let ev              = er.event;
            let statment        = {
                eid: ev.eid,
                questionTitle : ev.questionTitle
            }
            console.log(`${ev.eid} : ${ev.questionTitle}`);
        }
        console.timeEnd('test 事件生成');
// https://local.ddz2018.com/?sid=042e9de15ad6a0688e040eb7b1b27f9d&uid=ov5W35R-9V5h7f0gpZOJVNJuyabE&cid=101&line=[100107,100102,100109]&appName=travel&action=tour.tourstart

    }

}

module.exports = TestController;
