const Controller        = require('egg').Controller;
const apis              = require("../../../apis/travel");
const travelConfig      = require("../../../sheets/travel");
const ScenicPos         = require('../../../sheets/scenicpos');
const QuestRepoInstance = require("../../service/questService/questRepo");
const _                 = require("lodash");

let tour = new Map();
let userLines = new Map();

//观光相关
class TourController extends Controller {

    // 查询用户是否需要新手引导 双人引导是否需要新手引导 加一个双人引导的标记字段 user['doubleHasPlay'] = true
    async checkguide(ctx){
        let info            = apis.CheckGuide.Init(ctx);
        let user            = await this.ctx.model.PublicModel.User.findOne({uid: ctx.query.uid });
        info.hasPlay        = user['hasPlay'] ? true : false;
        info.submit();
    }

    //前端新手引导 标记一下已经完成新手引导了
    async finishguide(ctx){
        let info            = apis.FinishGuide.Init(ctx);
        await this.ctx.model.PublicModel.User.update({uid: ctx.query.uid }, {$set: {hasPlay: true}});
        info.submit();
    }



    async tourindexinfo(ctx) {
        let info            = await apis.TourIndexInfo.Init(ctx,true);
        if (!info.ui){ return; }
        let user_info       = info.ui;
        await this.service.travelService.tourService.tourindexinfo(info,user_info);
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
        await this.service.travelService.tourService.setrouter(info, info.ui);

        info.submit();
    }


    async modifyrouter(ctx) {
      //  info.code = apis.Code.DISABLE_SET_ROUTER;
     //   info.submit();
    //    return;

        let info      = await apis.ModifyRouter.Init(ctx,true);
        if ( !info.ui ) { return; }
        let user_info = info.ui;

        if(!Number(info.planedAllTracked)) {
            if(user_info.items[travelConfig.Item.GOLD] < travelConfig.Parameter.Get(travelConfig.Parameter.CHANGELINE).value) {
                info.code = apis.Code.NEED_MONEY;
                info.submit();
                return
            }
        }

        await this.service.travelService.tourService.modifyRouter(info, user_info);
        info.submit();
    }



    // 拍照
    async photography(ctx) {

        // return ctx.body = {
        //
        //     "code" :0,
        //     "data":{
        //         "postcard" : {
        //             id:"100101" ,
        //             pattern:"1",
        //             picture:"jingdian/beijing/beijing/jd/1.jpg",
        //             type:"1"
        //         }
        //     }
        // };
        /*
            用户到达景点后，可使用拍照功能，每个城市拍照有次数限制，购买单反相机可增加拍照次数，
            拍照时会获得一张该景点明信片，如果是双人旅行，则留下2人头像。
            如果不好实现，则头像改为签名。
            每个景点仅可拍照一次。
            部分明信片需要在特定季节获得。
        */
        let info            = await apis.Photography.Init(ctx,true);
        if (!info.ui) return;
        let user_info       = info.ui;
        await this.service.travelService.tourService.photography(info, user_info);
        info.submit();
    }

    // 观光
    async spottour(ctx) {

        // return ctx.body = {
        //     "code": 0,
        //     "data": {
        //         "action": "tour.reqenterspot",
        //         "userinfo": {
        //             "_id": "5ac48e69318e3403e4d69723",
        //             "uid": "1000001",
        //             "appName": "travel",
        //             "nickName": "gakaki",
        //             "avatarUrl": "",
        //             "gender": 0,
        //             "city": "",
        //             "province": "",
        //      dbghnjymy j9-[hm
        //       "country": "",
        //             "registertime": "1970-01-18T15:00:30.953Z",
        //             "pid": "1000001",
        //             "items": {
        //                 "1": 83520,
        //                 "2": 0
        //             },
        //             "__v": 0,
        //             "firstPlay": true,
        //             "hasPlay": true,
        //             "cumulativeDays": 4,
        //             "mileage": 0,
        //             "isDoubleFirst": true,
        //             "isSingleFirst": false,
        //             "isFirst": false,
        //             "friendList": [
        //                 "1000001"
        //             ],
        //             "third": true
        //         },
        //         "event": "16:00 在索菲亚教堂发现特产马尔第二宾坤二 消耗5金币 获得5根冰棍."
        //     }
        // };

        // 观光消耗金币，并会触发随机事件。（事件类型见文档随机事件部分）。
        let info            = await apis.SpotTour.Init(ctx , true);
        if ( !info.ui )  return;
        let user_info       = info.ui;
        await this.service.travelService.tourService.spotTour(info,user_info);
       // info.userinfo       = user_info;
        //await this.service.travelService.travelService.fillIndexInfo(info,user_info);
        info.submit();
    }

    // 随机事件问答题答案提交
    // https://local.ddz2018.com/tour/answerquest?uid=ov5W35XwjECAWGq0UK3omMfu9nak&id=5adadff87fad359ce9f4f121&answer=西藏
    async answerquest(ctx){
        let info            = apis.AnswerQuest.Init(ctx);
        await this.ctx.service.travelService.tourService.answerquest(info);
       // let user_info       = ctx.session.ui;
      //  await this.service.travelService.travelService.fillIndexInfo(info,user_info);
        info.submit();
    }
    //点开显示随机事件
    async eventshow(ctx){
        let info            = apis.EventShow.Init(ctx);
        await this.ctx.service.travelService.tourService.eventshow(info);
        info.submit();
    }

    //正在开发的事件
    async eventshowtest(ctx){
        let info             = apis.EventShow.Init(ctx);
        let uid              = info.uid;
        let currentCity      = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: uid });
        if(!currentCity) {
            info.code        = apis.Code.NO_CURRENTCITY;
            return;
        }
        let cid              = currentCity.cid;
        let cityEvents       = await this.ctx.model.TravelModel.CityEvents.findOne({
            uid              : uid
        });
        if (!cityEvents){
            info.code        = apis.Code.NOT_FOUND;
            info.submit();
            return;
        }
        let eventsNoReceived = cityEvents.events.filter( x => x.received == false && x.triggerDate <= new Date().getTime()).slice(0,11);
        this.logger.info(" [debug] 获得的事件数量 ",eventsNoReceived.length);

        let KEY_EVENTSHOW    = `eventShow:${uid}`;
        let eventShow        = await this.app.redis.zrange(KEY_EVENTSHOW,0,-1);
        let eventShowLength  = eventShow.length;
        let diff             = _.difference(eventsNoReceived.map( e => e.dbId.toString() ), eventShow);

        diff.forEach(async (e) => {
            let r = eventsNoReceived.find( row => row.dbId.toString() == e );
            await this.app.redis.zadd( KEY_EVENTSHOW , r.triggerDate, r.dbId.toString() );
        });

        let item_first       = await this.app.redis.zrange(KEY_EVENTSHOW,0,0);
        eventShowLength                                                  = await this.app.redis.zcount(KEY_EVENTSHOW,"-inf","+inf");
        if ( item_first && item_first.length == 1 ){
            await this.app.redis.zrem(KEY_EVENTSHOW,item_first[0]);
        }

        let event                                                        = null;
        if (eventsNoReceived.length >= 0){
            event                                                        = eventsNoReceived.find( e => e.dbId.toString() == item_first[0] );
        }

        if ( event ){
            await this.ctx.model.TravelModel.CityEvents.update( { uid    : uid , 'events.dbId': event.dbId } , {
                $set: {
                    'events.$.received': true, 'events.$.receivedDate': new Date().getTime()
                }
            });
        };

        ctx.body = JSON.stringify( {
            'current' : eventShowLength,
            'total'  : 10,
            'events' : event

        });
        return ctx.body;

// database get all events
// get all events not received
// into  the container for the counter
// if click 1 event show than counter -1 pop one event than add to received
// else add data to container
// need a list view to show all the event list
        info.submit();
    }

    // 轮询的时候告诉我要刷新哪个
    async freshspots(ctx) {
        let info                    = apis.FreshSpots.Init(ctx);
        await this.service.travelService.tourService.freshspots(info);
        info.submit();
    }
    // 最新景点
    async freshspotsfake(ctx) {

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
                ],
                display: 1 ,
                task : {
                    spot:[3,6],             // 3/6 景点完成度 一共6已完成3
                    tour:[0,2],              // 0/2 观光完成度 一共2已完成2
                    parterTour:[1,2],       //0/2 队友观光完成度 一共2已完成2(双人模式下)
                    photo:[1,2],            // 0/2 拍照完成度 一共2已完成2
                    parterPhoto:[2,2],      // 0/2 队友拍照完成度 一共2已完成2(双人模式下)
                }
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
        await this.service.questService.questService.freshspots(info);
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

        let info = await apis.ReqEnterspot.Init(ctx, true);
        if(!info.ui) {
            return
        }
        await this.service.questService.questService.reqenterspot(info);
        info.submit();
    }

    // 行程途中访问是否有随机事件 这是一个轮询接口 用来访问任务的随机事件的
    async playloop(ctx){
        this.logger.info("[playloop]");
        let info                    = apis.PlayLoop.Init(ctx);
        // await this.ctx.service.travelService.tourService.playloop(info);
        info.submit();
    }


    async rentprop(ctx) {
        let info = await apis.RentProp.Init(ctx, true);
        if(!info.ui) {
            return
        }
        await this.ctx.service.travelService.tourService.rentprop(info);
        info.submit();
    }

    async rentedprop(ctx) {
        let info = await apis.RentedProp.Init(ctx, true);
        if(!info.ui) {
            return
        }
        await this.ctx.service.travelService.tourService.rentedprop(info);
        info.submit();
    }

    async buypostcardlist(ctx) {
        let info = await apis.BuyPostcardList.Init(ctx, true);
        if(!info.ui) {
            return
        }
        await this.ctx.service.travelService.tourService.buypostcardlist(info);
        info.submit();
    }

    async buypostcard(ctx) {
        let info = await apis.BuyPostcard.Init(ctx, true);
        if(!info.ui) {
            return
        }
        await this.ctx.service.travelService.tourService.buypostcard(info);
        info.submit();
    }



     // 取消组队
     async cancelparten(ctx) {
        let info = await apis.CancelParten.Init(ctx, true);
         if(!info.ui) {
             return
         }
        await this.ctx.service.travelService.tourService.cancelparten(info);
        info.submit();
    }

     // 取消组队循环
     async cancelpartenloop(ctx) {
        let info = await apis.CancelPartenLoop.Init(ctx, true);
         if(!info.ui) {
             return
         }
        await this.ctx.service.travelService.tourService.cancelpartenloop(info);
        info.submit();
    }
}

module.exports = TourController;