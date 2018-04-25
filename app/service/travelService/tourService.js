const Service       = require('egg').Service;
const travelConfig  = require("../../../sheets/travel");
const ScenicPos     = require("../../../sheets/scenicpos");
const utilsTime     = require("../../utils/time");
const apis          = require("../../../apis/travel");
const constant      = require('../../utils/constant');
const questRepo     = require('../questService/questRepo');
const MakeRoadMap   = require("./makeRoadMap");
const MakeEvent     = require("./makeEvent");
const MakeSpotEvent = require("./makeSpotEvent");
const ShortPath     = require("../pathService/shortPath");
const moment        = require("moment");
const _             = require("lodash");
const  mongoose     = require('mongoose');
const  utils     = require('../../utils/utils');
class TourService extends Service {

    // 邀请码 查询当前队友
    async findAnotherPlayer(myUid){
        let curCity         = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: myUid });
        if(!curCity) {
            this.ctx.session.info.code = apis.Code.NOT_FOUND;
            this.ctx.session.info.submit();
            return;
        }
        let friendId        = curCity['friend'];
        let isInviter       = curCity['isInviter'];
        if ( !friendId || !isInviter ){
            return null; //shuomi
        }
        this.logger.info("[double guide]查询双人信息" + myUid + ` isInviter ${isInviter}`, "好友id是" + friendId + ` isInviter ${!isInviter}`);

        // partener 就是另一个玩家
        let partnetObj      = await this.ctx.model.PublicModel.User.findOne({ uid: friendId })
        if ( !partnetObj )  return null;
        this.logger.info(`查询队友信息 ${friendId}` + partnetObj['nickName']);

        let partener        = {
            uid:   friendId,
            nickName: partnetObj.nickName,
            gender:1,//性别
            img:partnetObj.avatarUrl,//头像地址
            isInviter:!isInviter //是否是邀请者 被邀请者当然是和邀请者相反咯
        }
        return partener;
    }
    async tourindexinfo(info, ui) {

        let uid                                                      = info.uid;
        let cid                                                      = parseInt(info.cid);
       // this.ctx.session.info                                        = info;

        info.partener                                                = await this.findAnotherPlayer(uid);
        // info.display        = currentCity['4'] > 0 ? "1":'0';  //开车还是行走的逻辑要补充下 从rentitems
        info.others                                                  = await this.ctx.service.publicService.friendService.findMySameCityFriends(ui.friendList, cid);

        let cityConfig                                               = travelConfig.City.Get( cid );
        if(!cityConfig) {
            info.code                                                = apis.Code.PARAMETER_NOT_MATCH;
            info.submit();
            return;
        }

        info.spots          = [];
        let spot_map        = {};

        let lng             = cityConfig['coordinate'][0];
        let lat             = cityConfig['coordinate'][1];

        let currentCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: info.uid });

        //this.logger.info(currentCity);
        info.present = currentCity.present;

        if(!currentCity.present && currentCity.friend) {
            let fcity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: currentCity.friend });
            if(fcity) {
                info.present = fcity.present;
            }
        }

        let hasCome = info.present;
        if(!currentCity.startTime) {
            for ( let spot_id of  cityConfig.scenicspot ){

                let spotsConfig                                      = travelConfig.Scenicspot.Get(spot_id);
                let xy                                               = ScenicPos.Get(spot_id);

                if ( spotsConfig == null ) continue;

                let row                                              = {
                    id                                               : spot_id,
                    cid                                              : cid,
                    x                                                : xy.x,
                    y                                                : xy.y,
                    isStart                                          : false,
                    tracked                                          : false, //是否经过了 等下从数据库比对
                    roundTracked                                     : false,//当前轮是否经过
                 //   index       : spotsConfig['index'],
                    trackedNo                                        : 0, //用户自己走的顺序
                    name                                             : spotsConfig['scenicspot'],
                    desc                                             : spotsConfig['description'],
                    building                                         : spotsConfig['building'],
                    index                                            : -1,
                }
                info.spots.push(row);
                //info.startCoordinate = spotsConfig.coordinate;

                spot_map[spot_id]                                    = row;
            }
        }else{
            let roadMaps                                             = currentCity.roadMap;
            for(let spot of roadMaps) {
                if(spot.index != -1) {
                    if(!spot.tracked) {
                        if(spot.endtime <= new Date().getTime()) {
                            spot.tracked                             = true;
                            spot.countdown                           = 0
                        }
                    }else{
                        if(spot.endtime <= new Date().getTime()) {
                            spot.roundTracked = true;
                            spot.countdown                               = 0
                        }
                    }

                }
                spot_map[spot.id]                                    = spot;
            }
            info.spots                                               = roadMaps;
            info.startTime                                           = currentCity.startTime.getTime();
            info.task                                                = this.taskInfo(uid);
        }
        let upset = {
            roadMap: info.spots,
        };

        if(hasCome) {
            upset.present = false;
        }
        await this.ctx.model.TravelModel.CurrentCity.update({ uid    : info.uid }, { $set: upset });


        info.startPos = ScenicPos.Get(cid).cfg;
        info.weather = await this.ctx.service.publicService.thirdService.getWeather(cid);
        info.others = await this.ctx.service.publicService.friendService.findMySameCityFriends(ui.friendList, cid);



        let acceleration = currentCity.acceleration;
        info.display = 0;

        if(acceleration) {
            for(let car of travelConfig.shops) {
                if(car.type == apis.RentItem.CAR) {
                    if(car.value == acceleration) {
                        info.display                                 = car.id;
                        break;
                    }
                }
            }
        }



        info.task = await this.queryTaskProgress(ui.uid, currentCity);
        info.mileage = ui.mileage;

    }


    async taskInfo(userId){
        let uid                           = userId;
        let currentCity                   = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: uid });
        let roadMaps                      = currentCity.roadMap;
        let spot_map                      = {};
        let spot_arrived_count            = 0;
        for(let spot of roadMaps) {
            if(spot.index != -1) {
                if(!spot.tracked) {
                    if(spot.endtime <= new Date().getTime()) {
                        spot.tracked      = true;
                        spot.countdown    = 0;
                    }
                }

                if(spot.tracked) {
                    if(spot.endtime <= new Date().getTime()) {
                        spot.roundTracked      = true;
                        spot.countdown    = 0;
                    }

                    if(spot.roundTracked) {
                        spot_arrived_count++;
                    }

                }

            }
            spot_map[spot.id]             = spot;
        }

        let spots                         = roadMaps;
      //  let startTime                     = currentCity.startTime.getTime();
        let acceleration                  = currentCity.acceleration;
        let display                       = 0;
        if(acceleration) {
            for(let car of travelConfig.shops) {
                if(car.type == apis.RentItem.CAR) {
                    if(car.value == acceleration) {
                        display           = car.id;
                        break;
                    }
                }
            }
        }

        //task任务完成度信息
        // let isDobule                      = !currentCity["friend"] ? false : true;
        //
        // let partner                       = null;
        // let partnerTour                   = [0,2];
        // let parterPhoto                   = [0,2];
        //
        // if (isDobule ){
        //     partner                       = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: currentCity["friend"] });
        //     // partner                       = null;
        //     if ( partner ){
        //         partnerTour               = [partner.tourCount,2];
        //         parterPhoto               = [partner.photographyCount,2];
        //     }
        // }

        // this.logger.info("是否是双人模式", isDobule , partner);
        //
        // let  task                         = {
        //     spot                    : [spot_arrived_count,6],
        //     tour                    : [currentCity['tourCount'],2],
        //     photo                   : [currentCity['photographyCount'],2],
        //     parterTour              : partnerTour,
        //     parterPhoto             : parterPhoto
        // };
        return {
             spots: spots,
             display: display, //人物的表现形式
            // task:task
             task: await this.queryTaskProgress(userId, currentCity),
        };
    }


    // 刷新节点信息
    async freshspots(info) {
        let r           = await this.taskInfo( info.uid );
        let ui = await this.ctx.model.PublicModel.User.findOne({ uid: info.uid });
        this.logger.info(  "--==fresh spots start ==--" );
        info.task       = r.task;
        info.spots      = r.spots;
        info.display    = r.display;
        info.mileage = ui.mileage;
    }

    //更新玩家游玩进度
    async updatePlayerProgress(currentCity, uid, spotId) {
        let cityConfig = travelConfig.City.Get(currentCity.cid);
        let roadMaps = currentCity.roadMap;
        for(let spot of roadMaps) {
            let update = false;
            let isOver = false;
            let hascome = false;
            if(spot.index != -1) {
                if(!spot.tracked) {
                    if(spot.endtime <= new Date().getTime()) {
                        spot.tracked = true;
                    }
                }
                if(spot.tracked) {
                    if(spotId) {
                        if(spotId == spot.id) {
                            update = true;
                            isOver = true;
                            //break;
                        }
                    }else {
                        let footPrints = await this.ctx.model.TravelModel.Footprints.findOne({ uid: uid, fid: currentCity.fid, scenicspot: spot.name });
                        let count = await this.ctx.model.TravelModel.Footprints.count({ uid: uid, scenicspot: spot.name });
                        if(!footPrints) {
                            update = true;
                        }
                        if(count > 0) {
                            hascome = true;
                        }

                    }

                }

            }

            if(update) {
                this.logger.info("更新足迹表");
                //更新足迹表
                await this.ctx.model.TravelModel.Footprints.create({
                    uid: uid,
                    fid: currentCity.fid,
                    cid: currentCity.cid,
                    country: cityConfig.country,
                    province: cityConfig.province,
                    city: cityConfig.city,
                    scenicspot: spot.name,
                    createDate: new Date(spot.endtime),
                });

                await this.ctx.service.travelService.rankService.updateCompletionDegreeRecord(uid, currentCity.cid);
                if(hascome) {
                    //增加积分
                    await this.ctx.service.travelService.integralService.add(uid, travelConfig.Parameter.Get(travelConfig.Parameter.SCENICSPOTAGAIN).value);
                }else{
                    //增加积分
                    await this.ctx.service.travelService.integralService.add(uid, travelConfig.Parameter.Get(travelConfig.Parameter.SCENICSPOTPOINT).value);
                }

                //更新里程数
                await this.ctx.model.PublicModel.User.update({ uid: uid }, { $inc: { mileage: spot.mileage } });
                if(isOver) {
                    break;
                }
            }
        }


    }


    //任务查询
    async queryTaskProgress(uid, currentCity, needUpdate = true, spotId = 0) {
        //let currentCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: uid });
        let cid = currentCity.cid;
        let cityConfig = travelConfig.City.Get(cid);
        if(needUpdate) {
            await this.updatePlayerProgress(currentCity, uid, needUpdate, spotId);
        }

        let parterTour = 0;
        let parterPhoto = 0;

        //景点任务
        let sTask = false;
        //观光任务
        let tTask = false;
        //拍照任务
        let pTask = false;


        //查找走过的景点数
        let sCount = await this.ctx.model.TravelModel.Footprints.count({ uid: uid, fid: currentCity.fid, cid: cid, scenicspot: { $ne: null } });
        this.logger.info("查找走过的景点数" , sCount);
        //查找拍照
        let photoCount = await this.ctx.model.TravelModel.PhotoLog.count({ uid: uid, fid: currentCity.fid, cid: cid });
        this.logger.info("查找拍照" , photoCount);
        //观光
        let tourCount = await this.ctx.model.TravelModel.SpotTravelEvent.count({ uid: uid, fid: currentCity.fid, cid: cid, isTour: true });
        this.logger.info("观光" , tourCount);



        if(sCount >= travelConfig.Parameter.Get(travelConfig.Parameter.SCENICSPOTNUMBER).value) {
            sCount = travelConfig.Parameter.Get(travelConfig.Parameter.SCENICSPOTNUMBER).value;
            sTask = true;
        }

        if(tourCount >= travelConfig.Parameter.Get(travelConfig.Parameter.TOURNUMBER).value) {
            tourCount = travelConfig.Parameter.Get(travelConfig.Parameter.TOURNUMBER).value;
            tTask = true
        }

        if(photoCount >= travelConfig.Parameter.Get(travelConfig.Parameter.PHOTOGRAGH).value) {
            photoCount = travelConfig.Parameter.Get(travelConfig.Parameter.PHOTOGRAGH).value;
            pTask = true;
        }

        if(currentCity.friend) {
            parterTour = await this.ctx.model.TravelModel.SpotTravelEvent.count({ uid: currentCity.friend, fid: currentCity.fid, cid: cid, isTour: true });
            parterPhoto = await this.ctx.model.TravelModel.PhotoLog.count({ uid: currentCity.friend, fid: currentCity.fid, cid: cid });
            if(parterTour >= travelConfig.Parameter.Get(travelConfig.Parameter.TOURNUMBER).value) {
                parterTour = travelConfig.Parameter.Get(travelConfig.Parameter.TOURNUMBER).value;

            }else{
                tTask = false;
            }
            if(parterPhoto >= travelConfig.Parameter.Get(travelConfig.Parameter.PHOTOGRAGH).value) {
                parterPhoto = travelConfig.Parameter.Get(travelConfig.Parameter.PHOTOGRAGH).value;
            }else{
                pTask = false;
            }
        }

        if(sTask && tTask && pTask) {
            //查找是否已经点亮
            let cityLight = await this.ctx.model.TravelModel.CityLightLog.findOne({ uid: uid, cid: cid });
            this.logger.info("是否已经点亮");
            if(!cityLight) {
                this.logger.info("创建点亮表");
                await this.ctx.model.TravelModel.CityLightLog.create({ uid: uid, cid: cid, province: cityConfig.province, lighten: true, createDate: new Date() });
                //更新足迹榜记录
                await this.ctx.service.travelService.rankService.updateFootRecord(uid);
            }
            if(currentCity.friend) {
                let cityLight = await this.ctx.model.TravelModel.CityLightLog.findOne({ uid: currentCity.friend, cid: cid });
                this.logger.info("是否已经点亮");
                if(!cityLight) {
                    this.logger.info("创建点亮表");
                    await this.ctx.model.TravelModel.CityLightLog.create({ uid: currentCity.friend, cid: cid, province: cityConfig.province, lighten: true, createDate: new Date() });
                    //更新足迹榜记录
                    await this.ctx.service.travelService.rankService.updateFootRecord(currentCity.friend);
                }
            }
        }

        return {
            spot: [ sCount, travelConfig.Parameter.Get(travelConfig.Parameter.SCENICSPOTNUMBER).value ],
            tour: [ tourCount, travelConfig.Parameter.Get(travelConfig.Parameter.TOURNUMBER).value ],
            parterTour: [ parterTour, travelConfig.Parameter.Get(travelConfig.Parameter.TOURNUMBER).value ],
            photo: [ photoCount, travelConfig.Parameter.Get(travelConfig.Parameter.PHOTOGRAGH).value ],
            parterPhoto: [ parterPhoto, travelConfig.Parameter.Get(travelConfig.Parameter.PHOTOGRAGH).value ],
        }



    }


    //查询该城市的拍照次数限制 注意购买单反相机之后的拍照次数 注意单反相机的逻辑
    async limitByCityAndSpotPhotoGraphyCount(uid, spotId, r) {
        // let userItems   = await this.service.travelService.PlayerService.getItems(uid);
        // if ( travelConfig.RentItem.CAMERA ){
        //     //拍照：每个城市可拍照2次，每个景点可拍照1次。购买单反相机可增加城市拍照次数，不能增加景点拍照次数。
        // }


        let count = await this.ctx.model.TravelModel.PhotoLog.count({ uid: uid, spotId: spotId, fid: r.fid });
        this.logger.info(count);
        if (count >= travelConfig.Parameter.Get(travelConfig.Parameter.SCENICPHOTO).value) {
            return false;
        }
        return true;
    }


    // 拍照
    async photography(info, ui) {
        let cid = info.cid;
        let city = travelConfig.City.Get(cid);
       // this.logger.info(city);
        if(!city) {
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            return;
        }
        let r = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: info.uid });
        if(!r) {
            info.code = apis.Code.NO_DB_ROW;
            return;
        }

        //查询城市的拍照次数
        if (!await this.limitByCityAndSpotPhotoGraphyCount(ui.uid, info.spotId, r)) {
            info.code = apis.Code.EXCEED_COUNT;
            return;
        }


        if (r.photographyCount == 0) {
            info.code = apis.Code.NEED_ITEMS;
            return;
        }

    //    this.logger.info(r);
      //  this.logger.info(await this.limitByCityAndSpotPhotoGraphyCount(ui.uid, info.spotId, r));


        // 获得明信片 读配置表 一个景点一个明信片 正好景点id同明信片id
        let cfgPostcard     = travelConfig.Postcard.Get(info.spotId);
        let dateNow         = new Date();
        let canGet = false;
        if(r.photographyCount == -1) {
            canGet = true;
        }
        if(!canGet) {
            let update = await this.ctx.model.TravelModel.CurrentCity.update({ uid: info.uid, photographyCount: { $gt: 0 } }, { $inc: { photographyCount: -1 } });
            if(update.nModified) {
                canGet = true;
            }
        }

        if(canGet) {
            let postcardId = "postcard" + ui.pid + info.spotId + new Date().getTime();
            await this.ctx.model.TravelModel.Postcard.create({
                uid: ui.uid,
                cid: cid,
                country: city.country,
                province: city.province,
                city: city.city,
                ptid: info.spotId,
                pscid: postcardId,
                type: cfgPostcard.type,                   //明信片类型
                createDate: dateNow,      //创建时间
            });

            //第一次获得这种明信片，获得积分
            let count = await this.ctx.model.TravelModel.Postcard.count({ uid: info.uid, ptid: info.spotId, cid: cid });
            if(count == 1) {
                this.ctx.service.travelService.integralService.add(info.uid, travelConfig.Parameter.Get(travelConfig.Parameter.POSTCARDPOINT).value);
            }
            this.ctx.service.travelService.rankService.updateCompletionDegreeRecord(info.uid, cid);
            // sysGiveLog表记录
            await this.ctx.model.TravelModel.SysGiveLog.create({
                uid: ui.uid,
                sgid: "sys" + ui.pid + info.spotId + new Date().getTime(),                                 //唯一id
                type: apis.SystemGift.POSTCARD,                                  // 3.明信片
                iid: info.spotId,                         //赠送物品id    金币 1 积分 2 飞机票 11(单人票) ，12(双人票)  其余配表id
                number: 1,                                  //数量
                isAdmin: "0",                                  //管理员赠送  系统送的为0 (这一栏是为了后台手动送道具)
                createDate: dateNow,                         //当前时间创建
            });
            //拍照日志
            await this.ctx.model.TravelModel.PhotoLog.create({
                uid: ui.uid,
                fid: r.fid, //飞行日志
                cid: cid, //城市id
                spotId: info.spotId, //景点id
                postcardId: postcardId, //获得的明信片id
                createDate: dateNow,
            });
            //返回明信片 id 图片
            info.postcard = cfgPostcard;
            info.freePhoto = r.photographyCount - 1 < -1 ? -1 : r.photographyCount - 1;
        }else{
            info.code = apis.Code.NEED_ITEMS;
        }
    }

    // 景点观光功能
    async spotTour(info, ui) {
        let sp = travelConfig.Scenicspot.Get(info.spotId);
        if(!sp) {
            info.code = apis.Code.NOT_FOUND;
            return
        }
        let city = travelConfig.City.Get(info.cid);
        if(!city) {
            info.code = apis.Code.NOT_FOUND;
            return
        }
        let currentCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: info.uid });
        if(!currentCity) {
            info.code = apis.Code.NO_CURRENTCITY;
            return
        }
        let free = true;
        if(!currentCity.tourCount) {
            free = false;
        }else{
            let update = await this.ctx.model.TravelModel.CurrentCity.update({ uid: info.uid, tourCount: { $gt: 0 } }, { $inc: { tourCount: -1 } });
            if(!update.nModified) {
                free = false;
            }else{
                info.freeSight = currentCity.tourCount - 1;
            }

        }

        if(!free) {
            // 用户到达景点后，跳转至景点界面，可使用观光功能，观光消耗金币，并会触发随机事件。（事件类型见文档随机事件部分）。
            let cost = travelConfig.Parameter.Get(travelConfig.Parameter.TOURCONSUME).value;
            if (ui.items[travelConfig.Item.GOLD] < cost) {
                info.code = apis.Code.NEED_MONEY;
                this.logger.info('您的现金不足速度充值');
                return;
            }
            //消耗金币
            this.ctx.service.publicService.itemService.itemChange(ui.uid, {["items." + travelConfig.Item.GOLD]: - cost }, 'travel');
            info.freeSight = 0;
        }

        // 景点随机事件 写表
        let cid                  = info.cid;
        let uid                  = info.uid;
        let weatherId            = await this.ctx.service.publicService.thirdService.getWeather(info.cid);
        let spotId               = info.spotId;
        let para                 = {
            uid                  : uid,
            cid                  : cid || 1,       //城市id
            spotid               : info.spotId,
            weatherId            : weatherId || 1,  //特定天气 注意是id        //特定日期 服务器端取呀
            rentItems          :currentCity.rentItems,
        };

        let e                    = new MakeSpotEvent(para);
       // this.logger.info("事件",e);

        let eid                  = e.event.id;
        //奖励 的数值
        this.logger.info(uid,cid,eid);

      //  this.logger.info(sp);
        let getReward = await this.ctx.service.publicService.rewardService.reward(uid,cid,eid);
        this.logger.info("获得的奖励" ,getReward);
        let questCfg  = questRepo.find(eid);
        let desc = questCfg.getSpotRewardComment(sp.scenicspot, getReward);
        let row                  = {
            uid:uid,
            eid:eid,        //事件id 这个是随机出来的
            desc: desc.desc,//时间描述
            reward: desc.reward,
            type: questCfg.type,
            subType: questCfg.trigger_type,
            cid:cid,           //cityId
            spotId:spotId,     //现在用不上
            fid:currentCity.fid,
            //   isPhotography:false,    //是否拍照
            isTour: true, //是否为观光
           // trackedNo:null,  //访问顺序
            createDate:new Date().getTime(),  //创建时间
            receivedDate:new Date().getTime(),  //领取奖励时间
            received:true ,  //是否已经接收 直接给予奖品
        }
        await this.ctx.model.TravelModel.SpotTravelEvent.create(row);

        //城市专有事件，更新完成度
        if(e.event.trigger_type == e.event.TriggerTypeKeys.TOUR_CITY) {
            this.ctx.service.travelService.rankService.updateCompletionDegreeRecord(uid, cid);
        }

        info.event          = desc;
        ui = info.ui = await this.ctx.model.PublicModel.User.findOne({uid: uid});
        info.goldNum        = ui.items[travelConfig.Item.GOLD];

       // info.userinfo       = ui;
    }

    // 游玩 回答问题
    // https://local.ddz2018.com/?sid=d9bb47efa9d5a73043d701599516c61e&uid=ov5W35XwjECAWGq0UK3omMfu9nak&cid=3&appName=travel&5adb3d45af8d8d10da2fe531&answer=更快点亮地图&id=&action=tour.answerquest
    async answerquest(info){
        let uid    = info.uid;
        let id     = info.id;     //数据库的事件id
        let answer = info.answer;

        let currentCity  = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: uid  });
        let cid          = currentCity['cid'];

        if (!id){
            info.code = apis.Code.NOT_FOUND;
            return
        }
        let dbId   = new mongoose.mongo.ObjectId(id);
        let row    = await this.ctx.model.TravelModel.CityEvents.findOne( { uid:uid , 'events.dbId' : dbId },  {'events.$': 1} );
        this.logger.info( "row is ", row);
        if ( !row || row['events'].length <= 0 ) {
            info.code = apis.Code.NOT_FOUND;
            info.submit();
            return;
        }


        let eid           = row['events'][0]['eid'];
        let received      = row['events'][0]['received'];
        // if(received == true) //说明已经领取过了不能再次领取
        // {
        //     info.code = apis.Code.EXCEED_COUNT;
        //     info.submit();
        //     return;
        // }

        let questCfg      = questRepo.find(eid);
        if ( !questCfg ) {
            info.code = apis.Code.NOT_FOUND;
            info.submit();
            return;
        }
        info.type         = questCfg.type;

        //无论如何都要把事件重置为recived
        await this.ctx.model.TravelModel.CityEvents.update( { uid:uid , 'events.dbId': dbId } , {
            $set : {'events.$.received' : true}
        });

        if(questCfg.trigger_type == questCfg.TriggerTypeKeys.RANDOM_CITY) {
            await this.ctx.service.travelService.rankService.updateCompletionDegreeRecord(uid, cid);
        }

        this.logger.info("这里的 UID CID EID 到底是多少 questCfg.type", uid , cid , eid ,questCfg.type,questCfg.trigger_type);
        //回答 问题 正确 和 无须回答问题的2个类型 都给予奖励
        if (questCfg.type == questCfg.EventTypeKeys.QA_NO_NEED_RESULT ){
            //给予奖励写入数据库
            let spotRewardComment = await this.rewardThanMark(  uid , cid , eid ,currentCity.fid);
            //回答正确 给予正确奖励
            info.correct      = true;
            //info.rewards      = questCfg.getSpotRewardComment();
            info.rewards      = spotRewardComment;
        }
        else if (questCfg.type == questCfg.EventTypeKeys.QA_NEED_RESULT && questCfg.answer == answer ){
            //给予奖励写入数据库
            let spotRewardComment = await this.rewardThanMark(  uid , cid , eid ,currentCity.fid);
            //回答正确 给予正确奖励
            info.correct      = true;
            //info.rewards      = questCfg.getSpotRewardComment();
            info.rewards      = spotRewardComment;
        }

        else
        {
            //回答错误 给予错误奖励 现在暂时没逻辑
            let rewardError  = questCfg['errorreward'];
            if ( rewardError == "0" ){

            }else{

            }
            info.correct      = false;
        }
        info.submit();
    }

    // 游玩 事件查看 http://127.0.0.1:7001/tour/eventshow?uid=1000001&cid=1
    async eventshow(info){

        this.logger.info("--==event show start==--");

        //这里要分离奖励 部分和 寻找答题部分
        //设置领取状态
        //spotTravelEvent 作为日志received 作为 存档表吧
        //所以查cid的cityevent表

        let uid                                                          = info.uid;
        let cid                                                          = info.cid;

        let currentCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: uid });
        if(!currentCity) {
            info.code = apis.Code.NO_CURRENTCITY;
            return;
        }

        let cityEvents                                                   = await this.ctx.model.TravelModel.CityEvents.findOne({
            uid                                                          : uid
        });
        let eventsNoReceived  = cityEvents.events.filter( x => x.received == false && x.triggerDate <= new Date().getTime());
        this.logger.info(" [debug] 获得的事件数量 ",eventsNoReceived);
        let eventsReceived    = cityEvents.events.filter( x => x.received == true );

        info.current                                                     = MakeEvent.fakeCalcCurrIndex(eventsReceived.length,eventsReceived.length);
        info.total                                                       = 10;
        let event                                                        = null;
        if (eventsNoReceived.length >= 0)
            event                                                        = eventsNoReceived[0];
        if ( !event ) {
            // info.code                                                    = apis.Code.NOT_FOUND;
            // info.submit();
            // return;
            info.current = 0;
            info.quest   = {};
            info.total   = 10;
            info.submit();
            return;
        }

        let eid                                                          = event["eid"];
        let questCfg                                                     = questRepo.find(eid);
        questCfg.dealKnowledgeRow(cid);
        let row                                                          = await this.rewardThanMark( uid,cid,eid,currentCity.fid);
        info.id                                                          = event['dbId'];
        info.quest                                                       = {
            dbId                                                         : event['dbId'],
            eid                                                          : eid, //前端没有此配置表
            type                                                         : questCfg.type,
            describe                                                     : questCfg.describeFormat(cid),
            gold_used                                                    : 0,
            picture                                                      : questCfg['picture'],
            // rewards:       questCfg.getSpotRewardComment().reward,
            rewards                                                      : row.reward,
            question                                                     : questCfg['describe'],
            answers                                                      : questCfg.answers(),
        };
        this.logger.info("当前的数据信息",uid,cid,eid,event.dbId );

        if (questCfg.type == questCfg.EventTypeKeys.COMMON){                //若是 普通的随机事件 那么直接触发获得奖励了
            // let row                 = await this.rewardThanMark( uid,cid,eid);
            await this.ctx.model.TravelModel.CityEvents.update( { uid    : uid , 'events.dbId': event.dbId } , {
                $set                                                     : {'events.$.received' : true , 'events.$.receivedDate' : new Date().getTime() }
            });
        }else if ( questCfg.type == questCfg.EventTypeKeys.QA_NO_NEED_RESULT ) {
            //在anserquest接口里领奖励
        }else if ( questCfg.type == questCfg.EventTypeKeys.QA_NEED_RESULT ) {
            //在anserquest接口里领奖励
        }

        info.submit();
    }

    // 写入数据库获得了奖励 并给予标记
    async rewardThanMark(  uid , cid , eid ,fid ){
        //若是 普通的随机事件 那么直接触发获得奖励了
        let reward = await this.ctx.service.publicService.rewardService.reward(uid,cid,eid);
        //标记已经获得奖励了


        this.logger.info(`uid , cid , eid ${uid} , ${cid} , ${eid}`);
        
        let now                 = new Date().getTime();
        let questCfg            = questRepo.find(eid);
        let city = travelConfig.City.Get(cid);
        let spotRewardComment = questCfg.getSpotRewardComment(city.city, reward);
        //添加到spotevent
        await this.ctx.model.TravelModel.SpotTravelEvent.create({
            uid: uid,
            eid: eid,
            cid: cid,
            fid: fid,
            spotId: null,
            isPhotography: false,
            isTour: true,
            reward: spotRewardComment.reward,
            desc: spotRewardComment.desc,
            type: questCfg.type,
            subType: questCfg.trigger_type,
            createDate: now,
            received: true,             //设置为已经领取
            receivedDate: now,           //领取奖励时间
        });

        return spotRewardComment.reward;
    }

    //观光??
    async tour(info, ui) {
        // info typeof apis.IndexInfo
     //   info.isFirst = ui.isFirst;
   //     info.gold = ui.items[travelConfig.Item.GOLD];
   //     let visit = await this.ctx.model.TravelModel.CurrentCity.findOne({uid: ui.uid});
   //     info.season = await this.ctx.service.publicService.thirdService.getSeason();
   //     let outw = 1;
    //    if (visit && visit.cid) {
    //        let weather = await this.ctx.service.publicService.thirdService.getWeather(travelConfig.City.Get(visit.cid));
     //       for (let we of travelConfig.weathers) {
     //           if (we.weather == weather) {
     //               outw = we.id;
     //               break;
     //           }
      //      }
      //      info.location = visit.cid;
      //  }
      //  info.weather = outw;
      //  info.playerCnt = await this.app.redis.get("travel_userid");
     //   info.friends = ui.friendList;
     //   info.unreadMsgCnt = await this.ctx.service.travelService.msgService.unreadMsgCnt(ui.uid);
    }

    async rentprop(info) {
        let curCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: info.ui.uid});
        if (curCity.rentItems[info.rentId] > 0) {
            this.logger.info(`道具${info.rentId}已经租赁了，无需重复租赁`);
            info.code = apis.Code.ALREADY_GOT;
            return;
        }

        let cfg = travelConfig.Shop.Get(info.rentId);
        if (!cfg) {
            this.logger.info(`道具商店表shop中未找到id为${info.rentId}的道具`);
            info.code = apis.Code.NOT_FOUND;
            return;
        }
        let needChange = [ info.uid ];

        if(curCity.friend) {
            let fCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: curCity.friend });
            if (fCity.rentItems[info.rentId] > 0) {
                this.logger.info(`道具${info.rentId}已经租赁了，无需重复租赁`);
                if(!info.forceBuy) {
                    info.code = apis.Code.ALREADY_GOT;
                    return;
                }

            }
            needChange.push(curCity.friend)
        }


        let rentItems = curCity.rentItems;
        rentItems[cfg.id] = 1;
        //扣钱
        let money = cfg.price;
        await this.ctx.service.publicService.itemService.itemChange(info.ui.uid, { ["items." + travelConfig.Item.GOLD]: -money }, 'travel');
        //加道具
        await this.ctx.model.TravelModel.CurrentCity.update({ uid: info.ui.uid }, { rentItems });
        this.logger.info(`租用道具${cfg.id}成功`);



        if(cfg.type == apis.RentItem.CAMERA) {
            if(cfg.value == -1) {
                await this.ctx.model.TravelModel.CurrentCity.update({ uid: needChange }, { $set: { photographyCount: cfg.value } }, { multi: true });
            }else{
               if(curCity.photographyCount != -1) {
                   await this.ctx.model.TravelModel.CurrentCity.update({ uid: needChange }, { $inc: { photographyCount: cfg.value } }, { multi: true });

               }
            }
        }

        let myRouteMap = [];
        if(cfg.type == apis.RentItem.CAR) {
            if(curCity.acceleration < cfg.value) {
                let outPMap = [];
                let planMap = [];
                if(curCity.roadMap) {
                    for(let planS of curCity.roadMap) {
                        if(planS.index != -1) {
                            planMap.push(planS);
                        }else{
                            outPMap.push(planS);
                        }
                    }
                    planMap = utils.multisort(planMap,
                        (a, b) => a.index - b.index);
                    for(let pMap of planMap) {
                        myRouteMap.push(pMap.id);
                    }

                    if(myRouteMap.length > 0) {
                        let para = {
                            oldLine: curCity.roadMap,
                            line: myRouteMap,
                            cid: curCity.cid,
                            isNewPlayer: info.ui.isNewPlayer,
                            rentItems: rentItems,
                            startTime: curCity.startTime,
                            weather              : 0, //这轮配置表里没有出现数据 留着下回做逻辑
                            today                : 0, //这轮配置表里没有出现数据 留着下回做逻辑
                            itemSpecial          : 0  //这轮配置表里没有出现数据 留着下回做逻辑
                        };

                        let rm = new MakeRoadMap(para);
                        let newRoadMap = rm.linesFormat;
                        for(let roadMap of myRouteMap) {
                            let index = newRoadMap.findIndex((n) => n.id == roadMap);
                            if(index != -1) {
                                outPMap.push(newRoadMap[index]);
                            }
                        }
                    }
                    //修改路线
                    await this.ctx.model.TravelModel.CurrentCity.update({ uid: needChange }, { $set: { roadMap: outPMap, acceleration: cfg.value, modifyEventDate: new Date() } }, { multi: true });
                }
            }
        }

        //此处需要通知事件逻辑层，来检测一下是否需要根据新道具来更新事件。。。。
    }


    async rentedprop(info) {
        let curCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: info.ui.uid});
        info.rentItems = Object.values(curCity.rentItems);
    }

    async buypostcardlist(info) {
        let cfg = await travelConfig.City.Get(info.cid);
        let pdids = cfg.postcard;
        let pts=[]
        pdids.forEach(ptid=>{
            let pt = travelConfig.Postcard.Get(ptid)
            if(pt.price == -1) {
                this.logger.info(`ptid为${ptid}的明信片尚未设置价格`)
            } else {
                pts.push({
                    ptid:pt.id,
                    picture:pt.picture,
                    price:pt.price
                })
            }
        })

        info.ptList = pts
    }

    async buypostcard(info) {
        let cfg = await travelConfig.Postcard.Get(info.ptid);
        let ui = info.ui
        if (!cfg) {
            this.logger.info(`明信片列表中未找到id为${info.ptid}的道具`);
            info.code = apis.Code.NOT_FOUND;
            return;
        }

        let city = await travelConfig.City.Get(cfg.cityid)
        if(!city) {
            this.logger.info(`找不到id为${cfg.cityid}的城市`)
            info.code = apis.Code.NOT_FOUND
        }

        let cost = cfg.price;
        if(cost == -1) {
            this.logger.info('该明信片没有设置价格')
            info.code = apis.Code.CANT_BUG;
            return
        }
        if (ui.items[travelConfig.Item.GOLD] < cost) {
            this.logger.info('您的现金不足速度充值');
            info.code = apis.Code.NEED_MONEY;
            return;
        }

        await this.ctx.service.publicService.itemService.itemChange(ui.uid, { ["items." + travelConfig.Item.GOLD]: -cost }, 'travel');

        ui = info.ui = await this.ctx.model.PublicModel.User.findOne({uid: ui.uid});
        //加明信片
        await this.ctx.model.TravelModel.Postcard.create({
            uid:ui.uid,
            cid:city.id,
            country:city.country,
            province:city.province,
            city:city.city,
            ptid:info.ptid,  //明信片配表ID 不唯一
            pscid:Date.now().toString(),//明信片专有ID  唯一
            type:city.type,//明信片类型
            createDate: new Date()
        });
        //第一次获得这种明信片，获得积分
        let count = await this.ctx.model.TravelModel.Postcard.count({ uid: info.uid, ptid: info.ptid, cid: cfg.cityid });
        if(count == 1) {
            this.ctx.service.travelService.integralService.add(info.uid, travelConfig.Parameter.Get(travelConfig.Parameter.POSTCARDPOINT).value);
        }
        this.ctx.service.travelService.rankService.updateCompletionDegreeRecord(ui.uid, cfg.cityid);
        this.logger.info(`购买明信片成功`);

        info.goldNum = ui.items[travelConfig.Item.GOLD];
    }

    async leavetour(selfInfo) {
        let curCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: selfInfo.uid });
        let short_path = new ShortPath(curCity.cid);
        let plan = curCity.roadMap;
        let real = [];
        let planMap = [];
        for(let planS of plan) {
            if(planS.index != -1) {
                if(planS.tracked || planS.endtime <= new Date().getTime()) {
                    planMap.push(planS);
                    //real[planS.index] = planS.id;
                }
            }
        }
        planMap = utils.multisort(planMap,
            (a, b) => a.index - b.index);
        for(let pMap of planMap) {
            this.logger.info(pMap.index);
            this.logger.info(pMap.id);
            real.push(pMap.id);
        }
        //this.logger.info(planMap);

        let efficiency = 0;
        let reward = 0;
        this.logger.info(real);
        if(real.length > 0) {
            this.logger.info(real);
            let path = short_path.travelShortDistance(real);

            let shortDistance = short_path.shortPath(real).min;

            //上个城市走的实际景点数
            let lastSN = real.length;
            this.logger.info("走过的景点数 " + lastSN);
            this.logger.info("最短路径 " + shortDistance);
            this.logger.info("我规划的路径 " + path);
             efficiency = parseFloat((shortDistance / path * 10).toFixed(1));
             reward = Math.floor(efficiency * lastSN * travelConfig.Parameter.Get(travelConfig.Parameter.SCOREREWARD).value / 100);
            //上个城市的评分奖励
            this.ctx.service.travelService.integralService.add(selfInfo.uid, reward);
            //更新足迹表
            await this.queryTaskProgress(selfInfo.uid, curCity);
          //  this.updatePlayerProgress(curCity, selfInfo.uid);

        }

        return {
            score: efficiency,
            reward: reward,
        }

    }

    async taskSpots(uid,cid){
        let r       = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: uid });

        //景点 至少达到 6 个景点。
        //观光 至少进行 2 次景点观光。
        //拍照 至少进行 2 次拍照留念。
        let task    = {
            'spot':     [r['photographySpots'].length, 6],
            'tour':     [r['tourCount'], 2],
            'photo':    [r['photographyCount'], 2]
        };
        let city    = travelConfig.City.Get(cid);
        let dbSpots = r['roadMap'];
        let spots   = city.scenicspot.map((s, idx) => {
            let o         = {};
            let cfg       = travelConfig.Scenicspot.Get(s);
            let xy        = ScenicPos.Get(s);
            o.id          = s;
            o.cid         = cid;
            o.name        = cfg.scenicspot;
            o.building    = cfg.building;
            o.x           = xy.x;
            o.y           = xy.y;
            o.tracked     = false;
            o.index       = -1;

            // 真实情况，读库
            if ( dbSpots.length > 0 ){
                let index = dbSpots.findIndex( line => line.id == s );
                let dbRow = dbSpots.find( r => r.id == s ) ;
                o.index   = index;
                if ( dbRow['arriveStamp'] < timeUtil.currentTimestamp() ){
                    o.tracked = true;
                }
            }

            return o;
        });

        return {
            'task'  : task,
            'spots' : spots
        };
    }

    //轮询访问地址
    async playloop(info){

        let uid                                                       = info.uid;
        let currentCity                                               = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: uid  });
        if (!currentCity ) {
            this.logger.info("城市没找到")
            info.code                                                 = apis.Code.NOT_FOUND;
            info.submit();
            return;
        }
        let currentEvents                                             = await this.ctx.model.TravelModel.CityEvents.findOne({ uid: uid});
        if (!currentEvents ) {
            currentEvents                                             = {events :[]}
        }

        this.logger.info("预存的事件数量", currentEvents.events.length);
        let cid                                                       = currentCity.cid;
        let timeNow                                                   = new Date().getTime();
        let events                                                    = currentEvents['events'];
        events                                                        = events.filter( r => r.triggerDate <= timeNow && r.received == false  );
        this.logger.info("事件数量 ",events.length);
        info.newEvent                                                 = events && events.length > 0 ? true : false;
        info.lastestEvent                                             = events.length > 0 ? events[0] : null;

        let spots                                                     = currentCity['roadMap'];
        let spotsHasArrived                                           = spots.filter(  r =>  r.arriveStamp  <= timeNow );
        if ( spotsHasArrived ){  //主要计算时间看景点是不是比已经到了 景点是否点亮 还有装备是否加了
            info.freshSpots                                           = true;
        }

        let spotsAllTrackedNum = spots.filter(  r =>  r.endtime && r.endtime  <= new Date().getTime() ) ? spots.filter(  r =>  r.endtime && r.endtime  <= new Date().getTime() ).length : 0;
        this.logger.info(spotsAllTrackedNum)
        this.logger.info("当前 spotsHasArrived ",spotsHasArrived.length);
        info.spotsTracked                                             = spotsHasArrived ? spotsHasArrived.length : 0;
        let citySpotsLength                                           = travelConfig.City.Get(cid).scenicspot.length;
        info.spotsAllTracked                                          = spotsAllTrackedNum == citySpotsLength;
        this.logger.info(`[debug] spotsHasArrived is ${spotsHasArrived.length} , spotsAllTracked ${info.spotsTracked} citySpotsLength is ${citySpotsLength}`);
        if ( info.spotsTracked == citySpotsLength){
            info.spotsTracked                                         = 0;
        }
        //路线是否已经规划完成，双人模式下，被邀请方规划路线完成后，通过此标记通知邀请方
        this.logger.info("friend roadmap ",currentCity['friend'] != "0" , currentCity['roadMap'].length > 0);
        // info.spotsPlaned         = currentCity['friend'] != "0" && currentCity['roadMap'].length > 0 ? true : false;
        // info.newEvent               = true;
    }


    //第一次点击开始游玩按钮
    async setrouter(info){
        let uid                  = info.uid;
        let cid                  = info.cid;
        let weather              = await this.ctx.service.publicService.thirdService.getWeather(cid);
        let today                = 0;
        //设置的路线
        let lines                = JSON.parse(info.line);
        //判断是否是第一次设置路线
        let currentCity          = await this.ctx.model.TravelModel.CurrentCity.findOne({
            'uid'        : uid,
            'cid'        : cid
        });
        let isDobule             = currentCity["friend"] ? true : false;

     //   this.logger.info(currentCity);

        let para                 = {
            oldLine              : currentCity.roadMap,
            line                 : lines,
            cid                  : cid,
            isNewPlayer          : info.ui.isNewPlayer,
            rentItems            : currentCity.rentItems,
            startTime            : currentCity.startTime,
            weather              : 0, //这轮配置表里没有出现数据 留着下回做逻辑
            today                : 0, //这轮配置表里没有出现数据 留着下回做逻辑
            itemSpecial          : 0  //这轮配置表里没有出现数据 留着下回做逻辑
        };

        let rm                   = new MakeRoadMap(para);

        let newRoadMap           = rm.linesFormat;
        let outPMap = [];
        for(let roadMap of currentCity.roadMap){
            let index = newRoadMap.findIndex((n) => n.id == roadMap.id);
            if(index != -1) {
                outPMap.push(newRoadMap[index]);
            }else{
                outPMap.push(roadMap);
            }
        }

        para['timeTotalHour']    = rm.timeTotalHour;

        let acceleration = rm.acceleration;
        let startTime = currentCity.startTime;
        info.display = 0;
        if(acceleration) {
            for(let car of travelConfig.shops) {
                if(car.type == apis.RentItem.CAR) {
                    if(car.value == acceleration) {
                        info.display = car.id;
                        break;
                    }
                }
            }
        }
        if(!startTime) {
            startTime                = new Date();
            // 第一次生成的时候修改事件 后面修改的时候不改了
            let e                    = new MakeEvent(para);

            //更新events表
           let up = await this.ctx.model.TravelModel.CityEvents.update({ uid: uid }, {
                $set : {
                    uid : uid,
                    events : e.eventsFormat
                }
            }, { upsert: true });

         this.logger.info("更新时间没？？？？？？？", up);
            // if ( inviteCode ){        //双人模式
            //     let partner         = await this.findAnotherPlayer(inviteCode,uid);
            //     if ( partner ){
            //         let f            = new MakeEvent(para);
            //         eventspartner    = f.eventsFormat;
            //
            //         await this.ctx.model.TravelModel.CityEvents.update({ uid: partner.uid }, {
            //             $set : {
            //                 uid : partner.uid,
            //                 events : f.eventsFormat
            //             }
            //         }, { upsert: true });
            //     }else{
            //         this.logger.info("没有找到对应的伙伴id 有问题！",  uid );
            //     }
            // }
        }

        //更新 currentcity的 roadmap
        await this.ctx.model.TravelModel.CurrentCity.update({
        'uid'        : uid,
        'cid'        : cid,
        },{ $set: {
                changeRouteing: false,
                roadMap: outPMap,
                acceleration: acceleration,
                startTime: startTime,
                modifyEventDate: new Date(),
        }});

        if(isDobule) {
            await this.ctx.model.TravelModel.CurrentCity.update({
                'uid'        : currentCity.friend,
                'cid'        : cid,
            },{ $set: {
                    changeRouteing: false,
                    roadMap: outPMap,
                    acceleration: acceleration,
                    startTime: startTime,
                    modifyEventDate: new Date(),
                }});
        }


        info.startTime           = startTime ? startTime.getTime() : new Date().getTime();
        info.spots               = outPMap;
    }


    async modifyRouter(info, ui) {
        let currentCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: info.uid });
        let isDouble = false;
        if(currentCity.friend) {
            let fcity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: currentCity.friend });
            if(fcity.changeRouteing) {
                info.code = apis.Code.ISCHANGING;
                return
            }
            isDouble = true;
        }
        if(currentCity.changeRouteing) {
            info.code = apis.Code.ISCHANGING;
            return
        }

        let spotsAllTracked = Number(info.spotsAllTracked);

        let roadMap = currentCity.roadMap;
        let hasOver = false;
      //  if(!spotsAllTracked) {

      //  }else{
            let map = roadMap.filter(n => n.endtime && n.endtime <= new Date().getTime());
            this.logger.info(map);
       //     this.logger.info(map.length);
            if(map.length == travelConfig.City.Get(currentCity.cid).scenicspot.length) {
                for(let i = 0; i < roadMap.length; i++) {
                    roadMap[i].index = -1;
                    roadMap[i].startime = "";
                    roadMap[i].endtime = "";
                    roadMap[i].tracked = true;
                    roadMap[i].roundTracked = false;
                    roadMap[i].mileage = 0;
                    roadMap[i].countdown = 0;
                    roadMap[i].arriveStamp = "";
                    roadMap[i].arriveStampYMDHMS = "";
                }
            }else{
                let needMap = utils.multisort(map,
                    (a, b) => a.index - b.index
                    );
                let lastspot = needMap.pop();
                let lastindex = -1;
                if(lastspot) {
                    if(lastspot.startime) {
                        lastindex = lastspot.index + 1;
                    }else{
                        hasOver = true;
                    }

                    this.logger.info(lastspot);
                    this.logger.info(map);
                    map.push(lastspot);
                }

                if(hasOver) {
                    for(let i = 0; i < roadMap.length; i++) {
                        let index = roadMap[i].index;
                        let haswalkindex = map.findIndex(n => n.index == index);
                        if(haswalkindex != -1) {
                            roadMap[i].tracked = true;
                            roadMap[i].roundTracked = true;
                        }else{
                            roadMap[i].index = -1;
                            roadMap[i].startime = "";
                            roadMap[i].endtime = "";
                            roadMap[i].mileage = 0;
                            roadMap[i].countdown = 0;
                            roadMap[i].arriveStamp = "";
                            roadMap[i].arriveStampYMDHMS = "";
                        }

                    }
                }else{
                    for(let i = 0; i < roadMap.length; i++) {
                        let index = roadMap[i].index;
                        let haswalkindex = map.findIndex(n => n.index == index);
                        if(haswalkindex != -1) {
                            roadMap[i].tracked = true;
                            roadMap[i].roundTracked = true;
                        }else if(index != lastindex){
                            roadMap[i].index = -1;
                            roadMap[i].startime = "";
                            roadMap[i].endtime = "";
                            roadMap[i].mileage = 0;
                            roadMap[i].countdown = 0;
                            roadMap[i].arriveStamp = "";
                            roadMap[i].arriveStampYMDHMS = "";
                        }else{
                            roadMap[i].startime = "";
                        }



                    }
                }




                    // if(roadMap[i].index != -1) {
                    //     if(!roadMap[i].roundTracked && roadMap[i].endtime <= new Date().getTime()) {
                    //         roadMap[i].tracked = true;
                    //         roadMap[i].roundTracked = true;
                    //     }
                    //
                    //     if(roadMap[i].index != 0) {
                    //         //   this.logger.info(roadMap[i].index);
                    //         //    this.logger.info(roadMap[i].name);
                    //         let cindex = roadMap[i].index;
                    //         //   this.logger.info("当前", cindex);
                    //         let index = roadMap.findIndex((n) => n.index == (cindex - 1));
                    //         //    this.logger.info("结束", index);
                    //         //   this.logger.info(roadMap[i]);
                    //         //   this.logger.info(roadMap[index]);
                    //         if (index == -1 || !roadMap[index].startime || !roadMap[i].roundTracked && roadMap[i].endtime > new Date().getTime() && roadMap[index].startime > new Date().getTime()) {
                    //             this.logger.info(roadMap[i].name);
                    //             roadMap[i].index = -1;
                    //             roadMap[i].startime = "";
                    //             roadMap[i].endtime = "";
                    //             roadMap[i].mileage = 0;
                    //             roadMap[i].countdown = 0;
                    //             roadMap[i].arriveStamp = "";
                    //             roadMap[i].arriveStampYMDHMS = "";
                    //         }
                    //         if(roadMap[i].endtime && roadMap[index].startime && roadMap[i].endtime >= new Date().getTime() && roadMap[index].startime <= new Date().getTime()) {
                    //             this.logger.info("重置");
                    //             this.logger.info(roadMap[i].name);
                    //             roadMap[i].startime = "";
                    //         }
                    //     }else{
                    //         if(roadMap[i].endtime >= new Date().getTime()) {
                    //             roadMap[i].startime = "";
                    //         }
                    //
                    //     }
                    //
                    // }

         //   }

        }


        let modify = 0;
        if(!Number(info.planedAllTracked)) {
            //扣钱
            modify = - travelConfig.Parameter.Get(travelConfig.Parameter.CHANGELINE).value;
            await this.ctx.service.publicService.itemService.itemChange(info.uid, { ["items." + travelConfig.Item.GOLD ]: modify });
           // await this.ctx.service.publicService.rewardService.gold(info.uid, -1 * travelConfig.Parameter.Get(travelConfig.Parameter.CHANGELINE).value);
           // info.goldNum = ui.items[travelConfig.Item.GOLD] - travelConfig.Parameter.Get(travelConfig.Parameter.CHANGELINE).value;
        }


       // ui = await this.ctx.model.PublicModel.User.findOne({ uid: info.uid });
       // info.startTime = currentCity.startTime.getTime();

        info.spots = roadMap;
        info.goldNum = ui.items[travelConfig.Item.GOLD] + modify;
        await this.ctx.model.TravelModel.CurrentCity.update({
            'uid'        : info.uid,
        },{ $set: {
                changeRouteing: currentCity.friend ? true : false,
                roadMap  : roadMap,
                modifyEventDate : new Date()
            }});
        if(isDouble) {
            await this.ctx.model.TravelModel.CurrentCity.update({
                'uid'        : currentCity.friend,
            },{ $set: {
                    roadMap  : roadMap,
                    modifyEventDate : new Date()
                }});
        }
    }

    // 取消组队 双人变单人
    async cancelparten(info){
        let uid         = info.uid; //注意这里的uid是那个主动离开的人的uid
        let partner     = await this.findAnotherPlayer(uid);

        // 两边用户的数据表记录 删除friend 字段

        //记录action
        this.ctx.model.PublicModel.UserActionRecord.create({
            uid: uid,
            type: apis.Code.USER_CANCEL_TEAM,
            createDate: new Date(),
        });
        // friend 置空
        await this.ctx.model.TravelModel.CurrentCity.update({ uid: [ uid, partner.uid ] }, { $set: { friend: null } }, { multi: true });
    }

    //双人变单人 要把events 离开的置空 清空 或者 记录action 事件
    async cancelpartenloop(info){
        let partner     = await this.findAnotherPlayer(info.uid);
        if ( !partner ){
                info.code = apis.Code.USER_CANCEL_TEAM;
                return;
        }else{

        }
    }
}


module.exports = TourService;