const Controller        = require('egg').Controller;
const apis              = require("../../../apis/travel");
const travelConfig      = require("../../../sheets/travel");
const ScenicPos         = require('../../../sheets/scenicpos');
const QuestRepoInstance = require("../../service/questService/questRepo");

let tour = new Map();
let userLines = new Map();

//观光相关
class TourController extends Controller {
    // 查询用户是否需要新手引导   1
    async checkguide(ctx){
        let info            = apis.CheckGuide.Init(ctx);
        let user            = await this.ctx.model.PublicModel.User.findOne({uid: ctx.query.uid });
        info.hasPlay        = user['hasPlay'] ? true : false;
        info.submit();
    }
    //前端新手引导 标记一下已经完成新手引导了  1
    async finishguide(ctx){
        let info            = apis.FinishGuide.Init(ctx);
        await this.ctx.model.PublicModel.User.update({uid: ctx.query.uid }, {$set: {hasPlay: true}});
        info.submit();
    }


    async tourindexinfor(ctx) {
        // http://127.0.0.1:7001/tour/tourindexinfor?uid=1000001&cid=1
        let info          = apis.TourIndexInfo.Init(ctx);
        let cid           = info.cid;
        let uid           = info.uid;

        let userInfo      = await ctx.service.publicService.userService.findUserBySid(uid);
        let weatherId     = await this.ctx.service.publicService.thirdService.getWeather(cid);
        //需要check下面的
        let friends       = await this.ctx.service.publicService.friendService.findMyFriends(uid,cid);
        
        let startPos      = ScenicPos.Get(cid).cfg;
        let firstPlay     = false;

        let taskSpots     = await this.ctx.service.travelService.tourService.taskSpots(uid,cid);
        let task          = taskSpots['task'];
        let spots         = taskSpots['spots'];

        info.task         = task;
        info.startPos     = startPos;
        info.weather      = weatherId;
        info.friendList   = friends;
        info.task         = task;
        info.spots        = spots;

     
        let user_info     = ctx.session.ui;
        await this.service.travelService.tourService.fillIndexInfo(info,user_info);
        info.firstPlay    = user_info.firstPlay;

        info.submit();
    }

    async tourindexinfo(ctx) {
        let info            = apis.TourIndexInfo.Init(ctx);
        let user_info       = ctx.session.ui;
        await this.service.travelService.tourService.tourindexinfo(info,user_info);
        //info.firstPlay      = user_info.firstPlay;
        info.submit();
    }

    async setrouter(ctx) {
        // http://127.0.0.1:7001/tour/setrouter/?sid=1000001&cid=1&line=[100107,100102,100109]&appName=travel
        let info = await apis.SetRouter.Init(ctx, true);
        if(!info.ui) {
            return
        }
        // let cid         = info.cid;
        // let uid         = info.uid;
        // let weather     = info.weather;
        // let line        = JSON.parse(info.line);

        let lines = JSON.parse(info.line);
        if(!lines || lines.length == 0) {
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            info.submit();
            return;
        }
        await this.service.travelService.tourService.setrouter(info);
     //   let user_info   = ctx.session.ui;
     //   await this.service.travelService.travelService.fillIndexInfo(info,user_info);
        
        info.submit();
    }


    async modifyrouter(ctx) {
        let info = apis.ModifyRouter.Init(ctx);

        let user_info = ctx.session.ui;
      //  this.logger.info(user_info);
        if(user_info.items[travelConfig.Item.GOLD] < travelConfig.Parameter.Get(travelConfig.Parameter.CHANGELINE).value) {
            info.code = apis.Code.NEED_MONEY;
            info.submit();
            return
        }
        await this.service.travelService.tourService.modifyRouter(info, user_info);
        info.submit();
    }



    // 拍照
    async photography(ctx) {

        return ctx.body = {

            "code" :0,
            "data":{
                "postcard" : {
                    id:"100101" ,
                    pattern:"1",
                    picture:"jingdian/beijing/beijing/jd/1.jpg",
                    type:"1"
                }
            }
        };
        /*
            用户到达景点后，可使用拍照功能，每个城市拍照有次数限制，购买单反相机可增加拍照次数，
            拍照时会获得一张该景点明信片，如果是双人旅行，则留下2人头像。
            如果不好实现，则头像改为签名。
            每个景点仅可拍照一次。
            部分明信片需要在特定季节获得。
        */
        let info            = apis.Photography.Init(ctx);
        let user_info       = ctx.session.ui;
        await this.service.travelService.tourService.photography(info,user_info);
        info.submit();
    }

    // 观光
    async spottour(ctx) {

        return ctx.body = {
            "code": 0,
            "data": {
                "action": "tour.reqenterspot",
                "userinfo": {
                    "_id": "5ac48e69318e3403e4d69723",
                    "uid": "1000001",
                    "appName": "travel",
                    "nickName": "gakaki",
                    "avatarUrl": "",
                    "gender": 0,
                    "city": "",
                    "province": "",
                    "country": "",
                    "registertime": "1970-01-18T15:00:30.953Z",
                    "pid": "1000001",
                    "items": {
                        "1": 83520,
                        "2": 0
                    },
                    "__v": 0,
                    "firstPlay": true,
                    "hasPlay": true,
                    "cumulativeDays": 4,
                    "mileage": 0,
                    "isDoubleFirst": true,
                    "isSingleFirst": false,
                    "isFirst": false,
                    "friendList": [
                        "1000001"
                    ],
                    "third": true
                },
                "event": "16:00 在索菲亚教堂发现特产马尔第二宾坤二 消耗5金币 获得5根冰棍."
            }
        };

        // 用户到达景点后，跳转至景点界面，可使用观光功能，
        // 观光消耗金币，并会触发随机事件。（事件类型见文档随机事件部分）。
        let info            = apis.SpotTour.Init(ctx);
        let user_info       = ctx.session.ui;
        // await this.service.travelService.tourService.spotTour(info,user_info);
        info.userinfo       = user_info;
        await this.service.travelService.travelService.fillIndexInfo(info,user_info);
        info.submit();
    }

    // 随机事件问答题答案提交
    // https://local.ddz2018.com/tour/tourspotanswer?uid=1000001&id=5acd8915a7955d4ba3a41824&answer=西藏
    async tourspotanswer(ctx){

        return ctx.body = {
            "data": {
                "action": "tour.answerquest",
                "correct": true,
                "userInfo": null,
                "rewards": {
                    "1": {
                        "name": "金币",
                        "type_id": "1",
                        "count": "100",
                        "countText": "+100"
                    },
                    "5": {
                        "name": "积分",
                        "type_id": "5",
                        "count": "229",
                        "countText": "+229"
                    }
                }
            },
            "code": 0
        };
        // id   db_id
        // eid  event id
        // answer 答案
        let info            = apis.AnswerQuest.Init(ctx);
        await this.ctx.service.travelService.tourService.tourspotanswer(info);
        let user_info       = ctx.session.ui;
        await this.service.travelService.travelService.fillIndexInfo(info,user_info);
        info.submit();
    }
    //点开显示随机事件
    async eventshow(ctx){
        return ctx.body     = {
            "data": {
                "action": "tour.eventshow",
                "total": null,
                "current": null,
                "quest": {
                    "id": "200049",
                    "type": 1,
                    "describe": "在刘氏梯号的花园美人靠上休憩，听着远处自鸣钟的声音，突然泛起了困意，不小心睡着了，钱包被偷。",
                    "picture": "jingdian/hunan/zhuzhou/jd/6.jpg",
                    "gold_used": 0,
                    "rewardText": {
                        "明信片": "+1",
                        "金币": "+500",
                        "积分": "+5",
                        "游玩时间": "+100",
                        "特产": "+1"
                    },
                    "question": "在刘氏梯号的花园美人靠上休憩，听着远处自鸣钟的声音，突然泛起了困意，不小心睡着了，钱包被偷。",
                    "answers": null
                },
                "userInfo": null
            },
            "code": 0
        };


        return ctx.body     = {
            "data": {
                "action": "tour.eventshow",
                "total": 10,
                "current": 2,
                "quest": {
                    "id": "120031。",
                    "type": 2,
                    "describe": "阿姨让你帮她去买一瓶水。",
                    "picture": "jingdian/hunan/zhuzhou/jd/6.jpg",
                    "gold_used": 0,
                    "rewardText": null,
                    "answers": ['东北平原','华北平原','长江中下游平原','关中平原']
                },
                "userInfo": null
            },
            "code": 0
        };

        return ctx.body     = {
            "data": {
                "action": "tour.eventshow",
                "total": 10,
                "current": 3,
                "quest": {
                    "id": "130212",
                    "type": 3,
                    "describe": "全国最大的平原是？",
                    "picture": "jingdian/hunan/zhuzhou/jd/6.jpg",
                    "gold_used": 5,
                    "rewardText": {
                        "明信片": "+1",
                        "金币": "+500",
                        "积分": "+5",
                        "游玩时间": "+100",
                        "特产": "+1"
                    },
                    "answers": ['东北平原','华北平原','长江中下游平原','关中平原']
                },
                "userInfo": null
            },
            "code": 0
        };

        let info            = apis.EventShow.Init(ctx);
        await this.ctx.service.travelService.tourService.eventshow(info);
        let user_info       = ctx.session.ui;
        await this.service.travelService.travelService.fillIndexInfo(info,user_info);
        info.submit();
    }

    // 最新景点
    async freshspots(ctx) {

        return ctx.body = {
            code : 0 ,
            data:{
                spots : [
                    {
                        "arriveStampYMDHMS" : "2018-04-17 18:39:33",
                        "arriveStamp" : 1523961573499.0,
                        "lat" : "40.364233",
                        "lng" : "116.016033",
                        "endtime" : 1523961573499.0,
                        "endTime" : 1523961573499.0,
                        "startime" : 1523961573499.0,
                        "startTime" : "",
                        "index" : (0),
                        "tracked" : false,
                        "y" : (292),
                        "x" : (196),
                        "building" : [
                            "22a",
                            "22b"
                        ],
                        "name" : "八达岭长城",
                        "cid" : "1",
                        "id" : (100107)
                    },
                    {
                        "arriveStampYMDHMS" : "2018-04-17 23:27:33",
                        "arriveStamp" : 1523978853499.0,
                        "lat" : "39.998547",
                        "lng" : "116.274853",
                        "endtime" : 1523978853499.0,
                        "endTime" : 1523978853499.0,
                        "startime" : 1523978853499.0,
                        "startTime" : "",
                        "index" : (1),
                        "tracked" : false,
                        "y" : (714),
                        "x" : (224),
                        "building" : [
                            "2a",
                            "2b"
                        ],
                        "name" : "颐和园",
                        "cid" : "1",
                        "id" : (100102)
                    }
                ]
            }
        };

        this.logger.info("最新景点数组");
        let questRow = QuestRepoInstance.find("130217");
        return ctx.body = {
            "code": 0,
            "data": {
                "action": "tour.reqenterspot",
                "spot": {
                    id: '100101',
                    scenicspot:"故宫",
                    weather:"1",
                    freePhoto:[2,2],
                    freeSight:[2,2],
                    picture:'jingdian/beijing/beijing/jd/1.jpg',
                    description:'故宫又名紫禁城，是中国乃至世界上保存最完整，规模最大的木质结构古建筑群，被誉为“世界五大宫之首”。故宫由永乐帝朱棣下令建造，依据其布局与功用分为“外朝”与“内廷”两大部分。'
                },
                "events": [
                    "16:00 在索菲亚教堂发现特产马尔第二宾坤二 消耗5金币 获得5根冰棍."
                ]
            }
        };

        let info                    = apis.ReqEnterspot.Init(ctx);
        await this.service.questService.questService.reqenterspot(info);
        info.submit();
    }

    // 进入景点
    async reqenterspot(ctx) {
        this.logger.info("进入景点观光");

        // let questRow = QuestRepoInstance.find("130217");
        // return ctx.body = {
        //     "code": 0,
        //     "data": {
        //         "action": "tour.reqenterspot",
        //         "spot": {
        //             id: '100101',
        //             scenicspot:"故宫",
        //             weather:"1",
        //             freePhoto:[2,2],
        //             freeSight:[2,2],
        //             picture:'jingdian/beijing/beijing/jd/1.jpg',
        //             description:'故宫又名紫禁城，是中国乃至世界上保存最完整，规模最大的木质结构古建筑群，被誉为“世界五大宫之首”。故宫由永乐帝朱棣下令建造，依据其布局与功用分为“外朝”与“内廷”两大部分。'
        //         },
        //         "events": [
        //             "16:00 在索菲亚教堂发现特产马尔第二宾坤二 消耗5金币 获得5根冰棍."
        //         ]
        //     }
        // };

        let info                    = apis.ReqEnterspot.Init(ctx);
        await this.service.questService.questService.reqenterspot(info);
        info.submit();
    }

    // 行程途中访问是否有随机事件 这是一个轮询接口 用来访问任务的随机事件的
    async playloop(ctx){
        
        return ctx.body = {
            'code': 0 ,
            'data':{
                'newEvent' : true,           //是否有新事件
                'freshSpots' : true,         // 是否要刷新景点状态列表，一些事件、装备会影响景点的到达时间
                'spotsTracked': 6,           // 有几个到达了
                'spotsAllTraced' : true      //
            }
        };

        this.logger.info("play loop");
        let info                    = apis.PlayLoop.Init(ctx);
        await this.ctx.service.travelService.tourService.playloop(info);
        info.submit();
    }
    //玩家完成该城市的经典的具体报告 在此回来查看城市完成报告的接口
    async showquestreport(ctx) {

    }

    //用户结束该城市旅游时，会给出用户的效率评分，并根据评分给予金币奖励。
 /*   async leavetour(ctx) {
        //离开城市的时候最好有个统计表哦
        //他还要保存他的进度 效率报告
        // 查询任务之前注意是否有点亮过
        // 离开的时候 不保留记录 就是比如他走了3个任务 他离开要重新开始的三个任务 要重来 所以走之前让前端来个提示吧

        let info = await apis.LeaveTour.Init(ctx, true);
        await this.ctx.service.travelService.tourService.leavetour(info);
        info.submit();
    }*/

    async rentprop(ctx) {
        let info = await apis.RentProp.Init(ctx, true);
        await this.ctx.service.travelService.tourService.rentprop(info);
        info.submit();
    }

    async rentedprop(ctx) {
        let info = await apis.RentedProp.Init(ctx, true);
        await this.ctx.service.travelService.tourService.rentedprop(info);
        info.submit();
    }

}

module.exports = TourController;