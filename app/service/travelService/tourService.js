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

class TourService extends Service {

    // 邀请码 查询当前队友
    async findAnotherPlayer2( uid){
        if( inviteCode ){
            //通过redis获取到当前的队友
            let doubleInfo      = await this.app.redis.hgetall(inviteCode);
            this.logger.info("查询双人信息" + uid, doubleInfo.inviter, doubleInfo.invitee != uid, doubleInfo.invitee);

            // partener 就是另一个玩家
            let partenerId      = [doubleInfo.inviter,doubleInfo.invitee].find(x => x != uid);
            let partnetObj      = await this.ctx.model.PublicModel.User.findOne({ uid: partenerId })
            if ( !partnetObj )  return null;

            this.logger.info(`查询队友信息 ${partenerId}` + partnetObj['nickName']);

            let partener        = {
                uid:   partenerId,
                nickName: partnetObj.nickName,
                gender:1,//性别
                img:partnetObj.avatarUrl,//头像地址
                isInviter:doubleInfo.inviter == uid ? true : false //是否是邀请者
            }
            return partener;
        }else{
            return null;
        }
    }


    async findAnotherPlayer(inviteCode, myUid){
        if( inviteCode ){
            //通过redis获取到当前的队友
            let doubleInfo      = await this.app.redis.hgetall(inviteCode);
            this.logger.info("查询双人信息" + myUid, doubleInfo.inviter, doubleInfo.invitee != myUid, doubleInfo.invitee);

            // partener 就是另一个玩家
            let partenerId      = [doubleInfo.inviter,doubleInfo.invitee].find(x => x != myUid);
            let partnetObj      = await this.ctx.model.PublicModel.User.findOne({ uid: partenerId })
            if ( !partnetObj )  return null;

            this.logger.info(`查询队友信息 ${partenerId}` + partnetObj['nickName']);

            let partener        = {
                uid:   partenerId,
                nickName: partnetObj.nickName,
                gender:1,//性别
                img:partnetObj.avatarUrl,//头像地址
                isInviter:doubleInfo.inviter == myUid ? false : true //是否是邀请者
            }
            return partener;
        }else{
            return null;
        }
    }
    async tourindexinfo(info, ui) {

        let uid             = info.uid;
        let isMulti         = false;
        let inviteCode      = 1231234;

         //是否双人模式  通过cid其实能够查到是否是双人模式
        let cid             = parseInt(info.cid);
        // 根据被邀请人的uid
        let fakeDouble      = {
                code        : 1231234,
                uid         : uid,
                inviter     : "ov5W35XwjECAWGq0UK3omMfu9nak",       //邀请者
                invitee     : "absdadew234resfdsfsd"                //被邀请者
                // ov5W35XwjECAWGq0UK3omMfu9nak (inviter) ====(invite邀请)====>invitee（被邀请者）
        };
        if ( fakeDouble ){
            await this.app.redis.hmset(inviteCode,fakeDouble);
        }
        info.partener       = await this.findAnotherPlayer(inviteCode,uid);
        // info.display        = currentCity['4'] > 0 ? "1":'0';  //开车还是行走的逻辑要补充下 从rentitems
        info.others         = await this.ctx.service.publicService.friendService.findMySameCityFriends(ui.friendList, cid);

        let cityConfig      = travelConfig.City.Get( cid );
        if(!cityConfig) {
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            info.submit();
            return;
        }
        info.spots          = [];
        let spot_map        = {};

        let lng             = cityConfig['coordinate'][0];
        let lat             = cityConfig['coordinate'][1];

        let currentCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: info.uid });

        //this.logger.info(currentCity);

        if(!currentCity.startTime) {
            for ( let spot_id of  cityConfig.scenicspot ){

                let spotsConfig = travelConfig.Scenicspot.Get(spot_id);
                let xy = ScenicPos.Get(spot_id);

                if ( spotsConfig == null ) continue;

                //  let lng           = spotsConfig['coordinate'][0];
                //  let lat           = spotsConfig['coordinate'][1];

                let row = {
                    id          : spot_id,
                    cid         : cid,
                    x         : xy.x,
                    y         : xy.y,
                    isStart     : false,
                    tracked     : false, //是否经过了 等下从数据库比对
                 //   index       : spotsConfig['index'],
                    trackedNo   : 0, //用户自己走的顺序
                    name        : spotsConfig['scenicspot'],
                    desc        : spotsConfig['description'],
                    building : spotsConfig['building'],
                    index       : -1,

                }
                info.spots.push(row);
                //info.startCoordinate = spotsConfig.coordinate;

                spot_map[spot_id] = row;
            }
        }else{
            let roadMaps = currentCity.roadMap;
            for(let spot of roadMaps) {
                if(spot.index != -1) {
                    if(!spot.tracked) {
                        if(spot.endtime <= new Date().getTime()) {
                            spot.tracked = true;
                            spot.countdown = 0
                        }
                    }else{
                        spot.countdown = 0
                    }

                }
                spot_map[spot.id] = spot;
            }
            info.spots = roadMaps;
            info.startTime = currentCity.startTime.getTime();
            info.task  = this.taskInfo(uid);
        }
        await this.ctx.model.TravelModel.CurrentCity.update({ uid: info.uid }, { $set: { roadMap: info.spots } });

        info.startPos = ScenicPos.Get(cid).cfg;
        info.weather = await this.ctx.service.publicService.thirdService.getWeather(cid);
        info.others = await this.ctx.service.publicService.friendService.findMySameCityFriends(ui.friendList, cid);
        let acceleration = currentCity.acceleration;
        info.display = 0;
        info.mileage = ui.mileage;
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

        info.task = await this.queryTaskProgress(ui.uid, cid);
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
                        spot_arrived_count++;
                    }
                }else{
                    spot.countdown        = 0
                }

            }
            spot_map[spot.id]             = spot;
        }

        let spots                         = roadMaps;
        let startTime                     = currentCity.startTime.getTime();
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
        let isDobule                      = !currentCity["friend"] ? false : true;
        let partnerTour                   = 0;
        let partner                       = 0;

        if (isDobule ){
            partner                       = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: currentCity["friend"] });
            partnerTour                   = [partner.tourCount,2];
        }
        let  task                         = {
            spot                   : [spot_arrived_count,6],
            tour                   : [currentCity['tourCount'],2],
            parterTour              : [partner.tourCount,2],
            photo                   : [currentCity['photographyCount'],2],
            parterPhoto             : [partner['photographyCount'],2],
        };
        return {
             spots: spots,
             display: display, //人物的表现形式
             task:task
        };
    }


    // 刷新节点信息
    async freshspots(info) {
        let r           = this.taskInfo( info.uid );
        info.task       = r.task;
    }

    //更新玩家游玩进度
    async updatePlayerProgress(currentCity, uid) {
        let cityConfig = travelConfig.City.Get(currentCity.cid);
        let roadMaps = currentCity.roadMap;
        for(let spot of roadMaps) {
            if(spot.index != -1) {
                if(!spot.tracked) {
                    if(spot.endtime <= new Date().getTime()) {
                        spot.tracked = true;
                    }
                }
                if(spot.tracked) {
                    let footPrints = await this.ctx.model.TravelModel.Footprints.findOne({ uid: uid, fid: currentCity.fid, scenicspot: spot.name });
                    if(!footPrints) {
                        this.logger.info("更新足迹表")
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
                        //更新里程数
                        await this.ctx.model.PublicModel.User.update({ uid: uid }, { $inc: { mileage: spot.mileage } });

                    }
                }

            }
        }
    }


    //任务查询
    async queryTaskProgress(uid, cid) {
        let currentCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: uid });
        let cityConfig = travelConfig.City.Get(cid);
        await this.updatePlayerProgress(currentCity, uid);

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
        }
        if(photoCount >= travelConfig.Parameter.Get(travelConfig.Parameter.PHOTOGRAGH).value) {
            photoCount = travelConfig.Parameter.Get(travelConfig.Parameter.PHOTOGRAGH).value;
        }
        if(tourCount >= travelConfig.Parameter.Get(travelConfig.Parameter.TOURNUMBER).value) {
            tourCount = travelConfig.Parameter.Get(travelConfig.Parameter.TOURNUMBER).value;
        }


        if(sCount >= travelConfig.Parameter.Get(travelConfig.Parameter.SCENICSPOTNUMBER).value && photoCount >= travelConfig.Parameter.Get(travelConfig.Parameter.PHOTOGRAGH).value && tourCount >= travelConfig.Parameter.Get(travelConfig.Parameter.TOURNUMBER).value) {
            //查找是否已经点亮
            let cityLight = await this.ctx.model.TravelModel.CityLightLog.findOne({ uid: uid, cid: cid });
            this.logger.info("是否已经点亮");
            if(!cityLight) {
                this.logger.info("创建点亮表");
                await this.ctx.model.TravelModel.CityLightLog.create({ uid: uid, cid: cid, province: cityConfig.province, lighten: true, createDate: new Date() });
                //更新足迹榜记录
                await this.ctx.service.travelService.rankService.updateFootRecord(uid, cid);
            }
        }

        return {
            spot: [ sCount, travelConfig.Parameter.Get(travelConfig.Parameter.SCENICSPOTNUMBER).value ],
            tour: [ tourCount, travelConfig.Parameter.Get(travelConfig.Parameter.TOURNUMBER).value ],
            photo: [ photoCount, travelConfig.Parameter.Get(travelConfig.Parameter.PHOTOGRAGH).value ],
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
        if (r.photographyCount == 0) {
            info.code = apis.Code.NEED_ITEMS;
            return;
        }
        //查询城市的拍照次数
        if (!await this.limitByCityAndSpotPhotoGraphyCount(ui.uid, info.spotId, r)) {
            info.code = apis.Code.EXCEED_COUNT;
            return;
        }
    //    this.logger.info(r);
      //  this.logger.info(await this.limitByCityAndSpotPhotoGraphyCount(ui.uid, info.spotId, r));


        // 获得明信片 读配置表 一个景点一个明信片 正好景点id同明信片id
        let cfgPostcard     = travelConfig.Postcard.Get(info.spotId);
        let dateNow         = new Date();
        let update = await this.ctx.model.TravelModel.CurrentCity.update({ uid: info.uid, photographyCount: { $gt: 0 } }, { $inc: { photographyCount: -1 } });
        if(update.nModified) {
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
            info.freePhoto = r.photographyCount - 1;
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
            weatherId            : weatherId || 1  //特定天气 注意是id        //特定日期 服务器端取呀
        };

        let e                    = new MakeSpotEvent(para);
      //  this.logger.info("事件",e);
        let eid                  = e.event.id;
        //奖励 的数值
        this.logger.info(uid,cid,eid);

      //  this.logger.info(sp);
        let getReward = await this.ctx.service.publicService.rewardService.reward(uid,cid,eid);
        this.logger.info(getReward);
        let desc = questRepo.find(eid).getSpotRewardComment(sp.scenicspot, getReward);
        let row                  = {
            uid:uid,
            eid:eid,        //事件id 这个是随机出来的
            desc: desc.desc,//时间描述
            reward: desc.reward,
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

        this.ctx.service.travelService.rankService.updateCompletionDegreeRecord(uid, cid);


        info.event          = desc;
        ui = info.ui = await this.ctx.model.PublicModel.User.findOne({uid: uid});
        info.goldNum        = ui.items[travelConfig.Item.GOLD];

       // info.userinfo       = ui;


    }

    // 游玩 回答问题
    async tourspotanswer(info){
        // id   db_id
        // answer 答案
        let uid    = info.uid;
        let id     = info.id;
        let answer = info.answer;

        let row    = await this.ctx.model.TravelModel.SpotTravelEvent.findOne({
            _id:     id
        });
        if ( !row ) {
            info.code = apis.Code.NOT_FOUND;
            info.submit();
            return;
        }

        let eid           = row['eid'];
        let questCfg      = questRepo.find(eid);
        let cid           = row['cid'];

        if (questCfg.answer == answer){

            //给予奖励写入数据库
            await this.rewardThanMark(  uid , cid , eid );

            //回答正确 给予正确奖励
            info.correct      = true;
            info.rewards      = questCfg.rewards;
        }else
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

        let uid             = info.uid;
        let cid             = info.cid;
        let cityEvents      = await this.ctx.model.TravelModel.CityEvents.findOne({
            uid:            uid
        });
        //过滤掉时间和received true的        没有领取并且小于当前时间的
        // let events          = cityEvents.events.filter( x => x.received == false && x.triggerDate <= new Date().getTime() ); //为了测试
        let events          = cityEvents.events.filter( x => x.received == false );

        this.logger.info("events content", events);

        info.total          = 10;
        info.current        = cityEvents.events.length - events.length
        info.current        = info.current <= 0 ? 1 : info.current;
        info.hasNext        = info.current + 1 >= events.length ? true : false;

        let event           = null;
        if (events.length >= 0)
            event           = events[0];
        if ( !event ) {
            info.code       = apis.Code.NOT_FOUND;
            info.submit();
            return;
        }
        // 设置eventcity那一行为update
        // let row             = await this.ctx.model.TravelModel.SpotTravelEvent.findOne({
        //     uid: uid,
        //     cid: cid,
        //     received:false
        // });
        // if ( !row ) {
        //     info.code       = apis.Code.NOT_FOUND;
        //     info.message    = "暂时没有事件"
        //     info.submit();
        //     return;
        // }

        let eid           = event["eid"];
        let questCfg      = questRepo.find(eid);

        //数据库记录id 方便答对答错之后的奖励
        info.id           = event['id'];
        info.quest        = {
            id:            eid, //前端没有此配置表
            type:          questCfg.type,
            describe:      questCfg['describe'],
            gold_used:     0,
            picture:       questCfg['picture'],
            rewards:       questCfg.getSpotRewardComment().reward,
            question:      questCfg['describe'],
            answers:       questCfg.answers(),
        };

        if (questCfg.type == questCfg.EventTypeKeys.COMMON){
            //若是 普通的随机事件 那么直接触发获得奖励了
            let row                 = await this.rewardThanMark( uid,cid,eid);
            //将当前时间设置为true
            await this.ctx.model.TravelModel.CityEvents.update( { uid:uid , 'events.id': event.id } , {
                $set : {'events.$.received' : true}
            });
            this.logger.info("当前的数据信息",uid,cid,eid,event.id );
            
            let now                 = new Date().getTime();
            //添加到spotevent
            await this.ctx.model.TravelModel.SpotTravelEvent.create({
                uid: uid,
                eid: eid, 
                cid: cid,
                fid: null,
                spotId: null,
                isPhotography: false,
                isTour:true,
                reward: questCfg.getSpotRewardComment().reward,
                type:questCfg.type,
                createDate: now,
                receivedDate:now,  //领取奖励时间
            });

        }else if ( questCfg.type == questCfg.EventTypeKeys.QA_NO_NEED_RESULT ) {
            info.quest['rewards']   = {};
        }else if ( questCfg.type == questCfg.EventTypeKeys.QA_NEED_RESULT ) {
            info.quest['rewards']   = {};
        }


        info.submit();
    }

    // 写入数据库获得了奖励 并给予标记
    async rewardThanMark(  uid , cid , eid  ){
        //若是 普通的随机事件 那么直接触发获得奖励了
        await this.ctx.service.publicService.rewardService.reward(uid,cid,eid);
        //标记已经获得奖励了
        let row  = await this.ctx.model.TravelModel.SpotTravelEvent.findOneAndUpdate(
        {
            uid: uid,
            cid: cid,
            received:false
        },
        {
            $set: {
                "receivedDate" : new Date() ,
                "received": true           //设置为已经领取
            }
        },
        {
            returnNewDocument: true
        });
        return row;
        // info.quest['time']      = row['receivedDate'];
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
                await this.ctx.model.TravelModel.CurrentCity.update({ uid: info.uid }, { $set: { photographyCount: cfg.value } });
            }else{
               if(curCity.photographyCount != -1) {
                   await this.ctx.model.TravelModel.CurrentCity.update({ uid: info.uid }, { $inc: { photographyCount: cfg.value } });

               }
            }
        }

        let myRouteMap = [];
        if(cfg.type == apis.RentItem.CAR) {
            if(curCity.acceleration < cfg.value) {
                if(curCity.roadMap) {
                    for(let planS of curCity.roadMap) {
                        if(planS.index != -1) {
                            myRouteMap[planS.index] = planS.id;
                        }
                    }
                    if(myRouteMap.length > 0) {
                        let para = {
                            oldLine: curCity.roadMap,
                            line: myRouteMap,
                            cid: curCity.cid,
                            isNewPlayer: info.ui.isNewPlayer,
                            rentItems: curCity.rentItems,
                            startTime: curCity.startTime,
                            weather              : 0, //这轮配置表里没有出现数据 留着下回做逻辑
                            today                : 0, //这轮配置表里没有出现数据 留着下回做逻辑
                            itemSpecial          : 0  //这轮配置表里没有出现数据 留着下回做逻辑
                        };

                        let rm = new MakeRoadMap(para);
                        let newRoadMap = rm.linesFormat;
                        let outPMap = [];
                        for(let roadMap of curCity.roadMap) {
                            let index = newRoadMap.findIndex((n) => n.id == roadMap.id);
                            if(index != -1) {
                                outPMap.push(newRoadMap[index]);
                            }else{
                                outPMap.push(roadMap);
                            }
                        }
                        //修改路线
                        await this.ctx.model.TravelModel.CurrentCity.update({
                            uid: info.uid,
                        }, { $set: {
                                roadMap: outPMap,
                                acceleration: rm.acceleration,
                                modifyEventDate: new Date(),
                            } });
                    }

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
        this.ctx.service.travelService.rankService.updateCompletionDegreeRecord(ui.uid, cfg.cityid);
        this.logger.info(`购买明信片成功`);

        info.goldNum = ui.items[travelConfig.Item.GOLD];
    }

    async leavetour(selfInfo) {
        let curCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: selfInfo.uid });
        let short_path = new ShortPath(curCity.cid);
        let plan = curCity.roadMap;
        let real = [];
        for(let planS of plan) {
            if(planS.index != -1) {
                if(planS.tracked || planS.endtime <= new Date().getTime()) {
                    real[planS.index] = planS.id;
                }
            }
        }
        let efficiency = 0;
        let reward = 0;
        this.logger.info(real);
        if(real.length > 0) {
            let path = short_path.travelShortDistance(real);
            let shortDistance = 0;
          //  let cityShortPath = await this.ctx.model.TravelModel.CityShortPath.findOne({ cid: curCity.cid });
          //  if(!cityShortPath) {
                shortDistance = short_path.shortPath(real).min;
         //   }else{
        //        shortDistance = cityShortPath.shortestDistance;
        //    }
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
            this.queryTaskProgress(selfInfo.uid, curCity.cid);
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
        
        let uid                 = info.uid;
        let currentCity         = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: uid  });
        if (!currentCity ) {
            info.code           = apis.Code.NOT_FOUND;
            info.submit();
            return;
        }
        let currentEvents       = await this.ctx.model.TravelModel.CityEvents.findOne({ uid: uid  });
        if (!currentEvents ) {
            info.code           = apis.Code.NOT_FOUND;
            info.submit();
            return;
        }

        let cid                  = currentCity.cid;
        let timeNow              = new Date().getTime();
        let timePrev             = timeNow - 60 * 10 * 1000; //10分钟之前到现在 放松限制

        this.logger.info("UID CID 是 ",uid,cid );
        this.logger.info("当前时间 ",timeNow, moment(timeNow).format('YYYY-MM-DD HH:mm:ss') , "间隔时间之前", moment(timePrev).format('YYYY-MM-DD HH:mm:ss'));

        info.newEvent            = true;
        if ( timePrev ){
            let events           = currentEvents['events'];
            events               = events.filter(  r =>  r.triggerDate  > timePrev && r.triggerDate < timeNow  );
            this.logger.info("事件数量 ",events.length);

            if ( events.length > 0 ){       
                info.newEvent    = true;    //是否有新事件
            }
        }
        
        let spots                = currentCity['roadMap'];
        let spotsHasArrived      = spots.filter(  r =>  r.arriveStamp  <= timeNow );
        if ( spotsHasArrived ){  //主要计算时间看景点是不是比已经到了 景点是否点亮 还有装备是否加了
            info.freshSpots      = true;
            //是否要刷新景点状态列表，一些事件、装备会影响景点的到达时间
        }

        this.logger.info("当前 spotsHasArrived ",spotsHasArrived.length);
        info.spotsTracked        = spotsHasArrived ? spotsHasArrived.length : 0;
        info.spotsAllTraced      = info.spotsTracked == travelConfig.City.Get(cid).scenicspot.length;
        if ( info.spotsAllTraced == true){
            info.spotsTracked    = 0;
        }
        //路线是否已经规划完成，双人模式下，被邀请方规划路线完成后，通过此标记通知邀请方
        this.logger.info("friend roadmap ",currentCity['friend'] != "0" , currentCity['roadMap'].length > 0);
        // info.spotsPlaned         = currentCity['friend'] != "0" && currentCity['roadMap'].length > 0 ? true : false;
    }


    //第一次点击开始游玩按钮
    async setrouter(info){
        let inviteCode           = info.inviteCode;
        let uid                  = info.uid;
        let cid                  = info.cid;
        let weather              = await this.ctx.service.publicService.thirdService.getWeather(cid);
        let today                = 0; //new Date().getDate();
        //设置的路线
        let lines                = JSON.parse(info.line);
        //判断是否是第一次设置路线
        let currentCity          = await this.ctx.model.TravelModel.CurrentCity.findOne({
            'uid'        : uid,
            'cid'        : cid
        });
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

            let eventMe              = {
                uid: uid,
                cid: cid,
                events: e.eventsFormat
            };
            let eventsNeedInsert    = [eventMe];

            if ( inviteCode ){        //双人模式
                let partner         = await this.findAnotherPlayer(inviteCode,uid);
                if ( partner ){
                    let f            = new MakeEvent(para);
                    eventspartner    = f.eventsFormat;
                    let eventOther   = {
                        uid: partner.uid,
                        cid: cid,
                        events: eventspartner
                    };
                    eventsNeedInsert.push(eventOther);
                }else{
                    this.logger.info("没有找到对应的伙伴id 有问题！", inviteCode , uid );
                }
            }
            //更新events表
            await this.ctx.model.TravelModel.CityEvents.insertMany(eventsNeedInsert);
        }



        //更新 currentcity的 roadmap
        await this.ctx.model.TravelModel.CurrentCity.update({
        'uid'        : uid,
        'cid'        : cid,
        },{ $set: {
            roadMap  : outPMap,
            acceleration: acceleration,
            startTime:startTime,
            modifyEventDate : new Date(),
        }});





        info.startTime           = startTime ? startTime.getTime() : new Date().getTime();
        info.spots               = outPMap;
    }


    async modifyRouter(info, ui) {
        let currentCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: info.uid });
        let roadMap = currentCity.roadMap;
        for(let i = 0; i < roadMap.length; i++) {
            if(roadMap[i].index != -1) {
                if(roadMap[i].index != 0) {
                    let index = roadMap.findIndex((n) => n.index == (roadMap[i].index - 1));
                    this.logger.info(roadMap[i].name);
                    this.logger.info(roadMap[index].name);
                    if (!roadMap[i].tracked && roadMap[i].endtime >= new Date().getTime() && roadMap[index].startime >= new Date().getTime()) {
                        roadMap[i].index = -1;
                        roadMap[i].startime = "";
                        roadMap[i].endtime = "";
                        roadMap[i].mileage = 0;
                        roadMap[i].countdown = 0;
                        roadMap[i].arriveStamp = "";
                        roadMap[i].arriveStampYMDHMS = "";
                    }
                }
            }
        }


        //扣钱
        await this.ctx.service.publicService.rewardService.gold(info.uid, -1 * travelConfig.Parameter.Get(travelConfig.Parameter.CHANGELINE).value);
       // info.startTime = currentCity.startTime.getTime();

        info.spots = roadMap;
        info.goldNum = ui.items[travelConfig.Item.GOLD] - travelConfig.Parameter.Get(travelConfig.Parameter.CHANGELINE).value;
        await this.ctx.model.TravelModel.CurrentCity.update({
            'uid'        : info.uid,
        },{ $set: {
                roadMap  : roadMap,
                modifyEventDate : new Date()
            }});
    }

    // 取消组队
    async cancelparten(info){
        //双人变单人 
        //要把events 离开的置空 清空invite code 或者invite code  //记录action 事件
        let inviteCode  = info.inviteCode;
        let uid         = info.uid; //注意这里的uid是那个主动离开的人的uid
        let partner     = await this.findAnotherPlayer(inviteCode,uid);
        
        //删除inviteCode 
        await this.ctx.service.travelService.doubleService.deleteCode(info);
        //记录action
        this.ctx.model.PublicModel.UserActionRecord.create({
            uid: uid,
            inviteCode: inviteCode,
            type: apis.Code.USER_CANCEL_TEAM,
            createDate: new Date(),
        });
        
        //删除current city里的 invite code中的用户id 的event 偷懒不删除了
        await this.ctx.model.TravelModel.CurrentCity.update({ uid: [ uid, partner.uid ] }, { $set: { friend: "0" } }, { multi: true });
    }
     
    async cancelpartenloop(info){
        //双人变单人 
        //要把events 离开的置空 清空invite code 或者invite code  //记录action 事件
        let partner     = await this.findAnotherPlayer(info.inviteCode,info.uid);
        if ( !partner ){
                info.code = apis.Code.USER_CANCEL_TEAM;
                return;
        }else{

        }
    }
}


module.exports = TourService;