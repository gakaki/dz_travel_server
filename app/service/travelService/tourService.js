const Service       = require('egg').Service;
const travelConfig  = require("../../../sheets/travel");
const utils         = require("../../utils/utils");
const apis          = require("../../../apis/travel");
const constant      = require('../../utils/constant');

class TourService extends Service {

    async userSpots(info, ui) {

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
        if ( this.limitByCityAndSpotPhotoGraphyCount( ui.ui , info.spotId ) ) {
            let result  = { data: {} };
            result.code = constant.Code.EXCEED_COUNT;
            return result;
        }

        // 增加拍照次数
        await this.ctx.model.TravelModel.CurrentCity.update({}, {
            $inc: { 'photographyCount':  1 },
            $push: { 'photographySpots': info.spotId}
        })
        // 获得明信片 读配置表
        await ctx.model.TravelModel.Postcard.Create({
            uid: ui.uid,
            cid: info.cid,
            country: "",
            province: "",
            city:"",
            ptid:"",
            pscid:info.spotId,
            type:"",                                 //明信片类型
            createDate: parseInt(Date.now()/1000)     //创建时间
        });
        // sysGiveLog表记录
        


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


}


module.exports = TourService;