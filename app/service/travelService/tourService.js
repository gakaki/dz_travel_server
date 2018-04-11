const Service       = require('egg').Service;
const travelConfig  = require("../../../sheets/travel");
const utilsTime     = require("../../utils/time");
const apis          = require("../../../apis/travel");
const constant      = require('../../utils/constant');
const questRepo     = require('../questService/questRepo');

class TourService extends Service {

    async tourindexinfo(info, ui) {

        await this.service.travelService.travelService.fillIndexInfo(info,ui);

        let cid             = parseInt(info.cid);
        let cityConfig      = travelConfig.City.Get( cid );

        info.spots          = [];
        let spot_map        = {};

        let lng             = cityConfig['coordinate'][0];
        let lat             = cityConfig['coordinate'][1];
        if (!lng || !lat){
            
        }

        //起点添加
        info.spots.push({
           'cid'        : cid,
           'lng'        : lng,
           'lat'        : lat,
           'isStart'    : true
        });

        for ( let spot_id of  cityConfig.scenicspot ){

            let spotsConfig = travelConfig.Scenicspot.Get(spot_id);
            if ( spotsConfig == null ) continue;

            let lng           = spotsConfig['coordinate'][0];
            let lat           = spotsConfig['coordinate'][1];
            
            let row = {
                id          : spot_id,
                cid         : spotsConfig['cid'],
                lng         : lng,
                lat         : lat,
                isStart     : false,
                tracked     : false, //是否经过了 等下从数据库比对
                index       : spotsConfig['index'],
                trackedNo   : 0, //用户自己走的顺序
                name        : spotsConfig['scenicspot'],
                desc        : spotsConfig['description'],
                buildingPic : spotsConfig['building'].split(",")
            }
            info.spots.push(row);
            info.startCoordinate = spotsConfig.coordinate;

            spot_map[spot_id] = row;
        }

        let spotsRowInDB        = await this.ctx.model.TravelModel.SpotTravelEvent.find({uid: ui.uid});
        let task_spot_finished  = 0;
        let task_tour_finished  = 0;
        let task_photo_finished = 0;

        for ( let row of spotsRowInDB ){
            let spotId                      = row['spotId'];

            spot_map[spotId]['tracked']     = true;              //数据库有记录的赋值，
            spot_map[spotId]['trackedNo']   = row['trackedNo'];  //数据库有记录的赋值，
            spot_map[spotId]['createDate']  = row['createDate']; //createDate

            task_spot_finished++;                               //有记录就算你到达了景点
            if ( row['isPhotography'] == true ){
                task_photo_finished++;
            }
            if ( row['isTour'] == true ){
                task_tour_finished++;
            }
        }

        //任务完成汇报
        let isPair          = false;          //是否双人默认否
        let task_spot_full  = isPair ? 3 : 6;
        info.task           = {
            spot :  [task_spot_finished,task_spot_full],
            tour :  [task_tour_finished,2],
            photo : [task_photo_finished,2]
        }
    }

    //查询该城市的拍照次数限制 注意购买单反相机之后的拍照次数 注意单反相机的逻辑
    async limitByCityAndSpotPhotoGraphyCount(uid,spotId){
        let r = await this.ctx.model.TravelModel.CurrentCity.findOne({uid: uid });
        if  ( !r ) {
            return true;
        }
        if ( parseInt(r['photographyCount']) >= 2 ){
            return false;
        }
        if ( spotId in r['photographySpots'] ){
            return false;
        }
        return true;
    }

    // 拍照
    async photography(info, ui) {

        let cid             = parseInt(info.cid);
        let cityConfig      = travelConfig.City.Get( cid );

        //查询城市的拍照次数
        if ( !this.limitByCityAndSpotPhotoGraphyCount( ui.ui , info.spotId )  ) {
            let result      = { data: {} };
            result.code     = constant.Code.EXCEED_COUNT;
            this.ctx.body   = result;
            return result;
        }

        // 增加拍照次数
        await this.ctx.model.TravelModel.CurrentCity.update({}, {
            $inc: { 'photographyCount':  1 },
            $push: { 'photographySpots': info.spotId}
        })

        //TODO post card 查询是否有存在的 明信片id

        // 获得明信片 读配置表 一个景点一个明信片 正好景点id同明信片id
        let cfgPostcard     = travelConfig.Postcard.Get(info.spotId);
        let dateNow         = new Date();
        await this.ctx.model.TravelModel.Postcard.create({
            uid: ui.uid,
            cid: info.cid,
            country: "",
            province: "",
            city:"",
            ptid:"",
            pscid:info.spotId,
            type: cfgPostcard.type,                   //明信片类型
            createDate:dateNow      //创建时间
        });
        // sysGiveLog表记录
        await this.ctx.model.TravelModel.SysGiveLog.create({
            uid:    ui.uid,
            sgid:   "",                                 //唯一id
            type:   3,                                  // 3.明信片
            iid:   info.spotId,                         //赠送物品id    金币 1 积分 2 飞机票 11(单人票) ，12(双人票)  其余配表id
            number: 1,                                  //数量
            isAdmin:0,                                  //管理员赠送  系统送的为0 (这一栏是为了后台手动送道具)
            createDate: dateNow                         //当前时间创建
        });

        //返回明信片 id 图片
        info.postcard   =  cfgPostcard;
    }

    // 景点观光
    async spotTour(info, ui) {

        let cost = travelConfig.Parameter.TOURCONSUME;
        if (ui.items[travelConfig.Item.GOLD] < cost) {
            info.code = apis.Code.NEED_MONEY;
            this.logger.info('小样你的钱不够啊。。快去充值才能观光');
            return;
        }

        //随机事件

        //扣钱
        await this.ctx.service.publicService.itemService.itemChange(ui.uid, {["items." + sheets.Item.GOLD]: - cost}, 'travel');
        ui   = info.ui = await this.ctx.model.PublicModel.User.findOne({uid: ui.uid});
        //加特产
        let sp = await this.ctx.model.TravelModel.Speciality.update({uid: ui.uid, spid: cfg.id},
            {
                uid: ui.uid,
                spid: cfg.id,
                $inc: {number: info.count},
                createDate: new Date()
            },
            {upsert: true});
        //购买记录
        await this.ctx.model.TravelModel.SpecialityBuy.create({
            uid: ui.uid,
            spid: cfg.id,
            number: info.count,
            numberLeft: sp.number,
            createDate: new Date()
        });
        this.logger.info(`购买特产成功,获得${cfg.specialityname} x ${info.count}`);

        info.goldNum = ui.items[sheets.Item.GOLD];
        // info typeof apis.IndexInfo
        let cid             = parseInt(info.cid);
        let cityConfig      = travelConfig.City.Get( cid );

        //查询城市的拍照次数
        if ( !this.limitByCityAndSpotPhotoGraphyCount( ui.ui , info.spotId )  ) {
            let result      = { data: {} };
            result.code     = constant.Code.EXCEED_COUNT;
            this.ctx.body   = result;
            return result;
        }

        // 增加拍照次数
        await this.ctx.model.TravelModel.CurrentCity.update({}, {
            $inc: { 'photographyCount':  1 },
            $push: { 'photographySpots': info.spotId}
        })

        //TODO post card 查询是否有存在的 明信片id

        // 获得明信片 读配置表 一个景点一个明信片 正好景点id同明信片id
        let cfgPostcard     = travelConfig.Postcard.Get(info.spotId);
        let dateNow         = new Date();
        await this.ctx.model.TravelModel.Postcard.create({
            uid: ui.uid,
            cid: info.cid,
            country: "",
            province: "",
            city:"",
            ptid:"",
            pscid:info.spotId,
            type: cfgPostcard.type,                   //明信片类型
            createDate:dateNow      //创建时间
        });
        // sysGiveLog表记录
        await this.ctx.model.TravelModel.SysGiveLog.create({
            uid:    ui.uid,
            sgid:   "",                                 //唯一id
            type:   3,                                  // 3.明信片
            iid:   info.spotId,                         //赠送物品id    金币 1 积分 2 飞机票 11(单人票) ，12(双人票)  其余配表id
            number: 1,                                  //数量
            isAdmin:0,                                  //管理员赠送  系统送的为0 (这一栏是为了后台手动送道具)
            createDate: dateNow                         //当前时间创建
        });

        //返回明信片 id 图片
        info.postcard   =  cfgPostcard;
    }

    // 游玩 回答问题 http://127.0.0.1:7001/tour/tourspotanswer?uid=1000001&id=5acd8915a7955d4ba3a41824&answer=西藏
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

        //这里要分离奖励 部分和 寻找答题部分
        //设置领取状态

        let row             = await this.ctx.model.TravelModel.SpotTravelEvent.findOne({
            uid: info.uid,
            cid: info.cid,
            received:false
        });

        if ( !row ) {
            info.code = apis.Code.NOT_FOUND;
            info.submit();
            return;
        }

        let eid           = row["eid"];
        let questCfg      = questRepo.find(eid);

        //数据库记录id 方便答对答错之后的奖励
        info.id           = row['_id'];
        info.quest        = {
            id:            eid,
            type:          questCfg.type,
            describe:      questCfg['describe'],
            gold_used:     0,
            rewards:       questCfg.rewards,
            question:      questCfg['describe'],
            answers:       questCfg.answers(),
        };

        if (questCfg.type == questCfg.EventTypeKeys.COMMON){
            //若是 普通的随机事件 那么直接触发获得奖励了
            let row                 = await this.rewardThanMark(info.uid,info.cid,eid);
            info.quest['time']      = row['receivedDate'];

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

    //观光
    async tour(info, ui) {
        // info typeof apis.IndexInfo
        info.isFirst = ui.isFirst;
        info.gold = ui.items[travelConfig.Item.GOLD];
        let visit = await this.ctx.model.TravelModel.CurrentCity.findOne({uid: ui.uid});
        info.season = await this.ctx.service.publicService.thirdService.getSeason();
        let outw = 1;
        if (visit && visit.cid) {
            let weather = await this.ctx.service.publicService.thirdService.getWeather(travelConfig.City.Get(visit.cid).city);
            for (let we of travelConfig.weathers) {
                if (we.weather == weather) {
                    outw = we.id;
                    break;
                }
            }
            info.location = visit.cid;
        }
        info.weather = outw;
        info.playerCnt = await this.app.redis.get("travel_userid");
        info.friends = ui.friendList;
        info.unreadMsgCnt = await this.ctx.service.travelService.msgService.unreadMsgCnt(ui.uid);
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
            this.logger.info(`道具商店表shop中未找到id为${info.rentId}的道具`)
            info.code = apis.Code.NOT_FOUND;
            return;
        }

        let rentItems = curCity.rentItems;
        rentItems[cfg.id] = 1;
        //扣钱
        let money = cfg.price;
        await this.ctx.service.publicService.itemService.itemChange(info.ui.uid, {["items." + travelConfig.Item.GOLD]: -money}, 'travel');
        //加道具
        await this.ctx.model.TravelModel.CurrentCity.update({uid: info.ui.uid}, { rentItems });
        this.logger.info(`租用道具${cfg.id}成功`);

        //此处需要通知事件逻辑层，来检测一下是否需要根据新道具来更新事件。。。。
    }


    async rentedprop(info) {
        let curCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: info.ui.uid});
        info.rentItems = Object.values(curCity.rentItems);
    }

    async leavetour(info) {
        let ui = info.ui;
        let curCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: ui.uid});
        let tourLog = await this.ctx.model.TravelModel.CityTourLog.findOne({ uid: ui.uid, cid: curCity.cid });
        let log = {};
        //到达过的景点，在游玩轮询里，当每次后端确认到达了这某个景点时，记录到cityTourLog中，所以此处不再处理，只更新一下到达过的景点数

    }

}


module.exports = TourService;