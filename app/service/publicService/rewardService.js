/*
    1金币
    2时间
    3明信片：后面跟明信片id，明信片id填-1表示该城市随机特产明信片
    4特产：后面跟特产id，
    5积分
*/
const travelConfig  = require("../../../sheets/travel");
const Service       = require('egg').Service;
const apis          = require('../../../apis/travel');
const questRepo     = require('../questService/QuestRepo');


// 专门处理各种奖励服务
class RewardService extends Service{

    async reward( uid , cid , eid ) {

        let eventCfg        = questRepo.find(eid)
        if( !eventCfg ){
            this.logger.info("事件不存在" + eid );
            info.code       = apis.Code.PARAMETER_NOT_MATCH;
            info.submit();
            return;
        }

        for ( let k in eventCfg.rewardKV) {

            let  v = eventCfg.rewardKV[k];

            if ( k == eventCfg.RewardType.GOLD){ // 金币
                await this.gold(v);
            }
            if ( k == eventCfg.RewardType.TIME){// 城市总时间
                await this.time( uid , cid , eid , timeAppend = v );
            }
            if ( k == eventCfg.RewardType.POSTCARD){// 明信片
                await this.postcard( uid , cid , v );
            }
            if ( k == eventCfg.RewardType.Speciality){ //特产
                await this.speciality( uid , cid ,v );
            }
            if ( k == eventCfg.RewardType.POINT){ // 点数
                await this.integral( uid, v );
            }
        }

        return eventCfg;
    }
    // 奖励金钱
    async gold( uid , num = 0 ) {
        await this.ctx.service.publicService.itemService.itemChange( uid,  {["items."+travelConfig.Item.GOLD] :  v }, "travel");
    }

    // 该用户在该城市的总游玩时间 追加时间
    async time( uid , cid , eid , timeAppend = 0 ) {
        await this.ctx.service.publicService.itemService.itemChange(ui.uid,  {["items."+travelConfig.Item.GOLD] :  num }, "travel");
        await this.ctx.model.travelModel.currentCity.update(
            {
                'uid': uid,
                'cid': cid
            },
            {
                $push: {
                    rewardAppendTime : {
                        createDate: new Date(),
                        timeNum: timeAppend,
                        eid: eid
                    }
                }
            }
        )
    }

    // 奖励明信片的服务
    async postcard( uid , cid , cfgId  ) {
        if ( cfgId == "-1") {
            //3  明信片：后面跟明信片id，明信片id 填-1表示该城市随机特产明信片

        }
        // 获得明信片 读配置表 一个景点一个明信片 正好景点id同明信片id
        let cfgPostcard     = travelConfig.Postcard.Get( cfgId );
        let dateNow         = new Date();
        await this.ctx.model.TravelModel.Postcard.create({
            uid: uid,
            cid: cid,
            country: "",
            province: "",
            city:"",
            ptid:"",
            pscid:cfgId,
            type: cfgPostcard.type,                   //明信片类型
            createDate:dateNow      //创建时间
        });
        // sysGiveLog表记录
        await this.ctx.model.TravelModel.SysGiveLog.create({
            uid:    uid,
            sgid:   "",                                 //唯一id
            type:   3,                                  // 3.明信片
            iid:   cfgId,                         //赠送物品id    金币 1 积分 2 飞机票 11(单人票) ，12(双人票)  其余配表id
            number: 1,                                  //数量
            isAdmin:0,                                  //管理员赠送  系统送的为0 (这一栏是为了后台手动送道具)
            createDate: dateNow                         //当前时间创建
        });
    }

    // 奖励特产的服务
    async speciality(  uid , cid , cfgId , count = 1 ) {

        if(!travelConfig.Speciality.Get(cfgId)){
            this.logger.info("特产不存在" + cfgId);
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            info.submit();
            return
        }

        //加特产
        let sp = await this.ctx.model.TravelModel.Speciality.update({uid: uid, spid: cfgId },
        {
            uid: uid,
            spid: cfgId,
            $inc: {number: count },
            createDate: new Date()
        },
        {upsert: true});
        //syslog 记录
        await this.ctx.model.TravelModel.SysGiveLog.create({
            uid:    uid,
            sgid:   "",                                 //唯一id
            type:   2,                                  // 3.明信片
            iid:   cfgId,                              //赠送物品id    金币 1 积分 2 飞机票 11(单人票) ，12(双人票)  其余配表id
            number: 1,                                  //数量
            isAdmin:0,                                  //管理员赠送  系统送的为0 (这一栏是为了后台手动送道具)
            createDate: new Date()                      //当前时间创建
        });
        this.logger.info(`系统赠送特产成功,获得 ${cfgId}  x ${count}`);
    }

    // 奖励积分的服务
    async integral( uid , integral  ) {
        await this.ctx.service.publicService.itemService.itemChange( uid, {["items." + travelConfig.Item.POINT]: integral }, 'travel');
    }
}


module.exports = RewardService;