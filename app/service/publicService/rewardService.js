/*
    1金币
    2积分
    3 时间
    4特产：后面跟特产id，
    5明信片：后面跟明信片id，明信片id填-1表示该城市随机特产明信片
*/
const travelConfig  = require("../../../sheets/travel");
const Service       = require('egg').Service;
const apis          = require('../../../apis/travel');
const questRepo     = require('../questService/questRepo');
const postcardRepo  = require('../configService/postcardRepo');


// 专门处理各种奖励服务
class RewardService extends Service{

    async reward( uid , cid , eid ) {
        let eventCfg        = questRepo.find(eid);
        if( !eventCfg ){
            throw new Error({
                code: apis.Code.PARAMETER_NOT_MATCH,
                message: "事件不存在" + eid
            });
        }

        this.logger.info("--== RewardService Reward method ==--");
        this.logger.info("event  eid id ", eventCfg.eid ,eventCfg.type );

        let reward = [];
        for ( let k in eventCfg.rewardKV) {

            let  v = eventCfg.rewardKV[k];

            if ( k == eventCfg.RewardType.GOLD){ // 金币
                if(await this.gold( uid , Number(v))){
                    reward.push(
                        {
                            k:k,
                            v:v
                        }
                    )
                }
            }
            if ( k == eventCfg.RewardType.TIME){// 城市总时间
                if(await this.time( uid , cid , eid ,  v )){
                    reward.push(
                        {
                            k:k,
                            v:v
                        }
                    )
                }

            }
            if ( k == eventCfg.RewardType.POSTCARD){// 明信片
                 if(await this.postcard( uid , cid , v )) {
                     reward.push(
                         {
                             k:k,
                             v:v,
                             n:1
                         }
                     )
                }
            }
            if ( k == eventCfg.RewardType.Speciality){ //特产
                this.logger.info(v);
                 if(await this.speciality( uid , cid ,v )) {
                     reward.push(
                         {
                             k:k,
                             v:v,
                             n:1
                         }
                     )
                 }else{
                     reward.push(
                         {
                             k:k,
                             v:v,
                             n:0,
                         }
                     )
                 }
            }
            if ( k == eventCfg.RewardType.POINT){ // 点数
                if(await this.integral( uid, Number(v) )){
                    reward.push(
                        {
                            k:k,
                            v:v
                        }
                    )
                }
            }
        }

        return reward;
    }
    // 奖励金钱
    async gold( uid , num = 0 ) {
        await this.ctx.service.publicService.itemService.itemChange( uid,  {["items."+travelConfig.Item.GOLD] :  num }, "travel");
        return true;
    }

    async time( uid , cid , eid , timeAppend = 0 ) {

        await this.ctx.model.TravelModel.CurrentCity.update(
            {
                'uid': uid
            },
            {
                $push: {
                    rewardAppendTime : {
                        createDate: new Date(),
                        timeNum: parseInt(timeAppend),
                        eid: eid
                    }
                }
            }
        )
        return true;
    }

    // 奖励明信片的服务
    async postcard( uid , cid , cfgId  ) {
        let postCard        = null;
        if ( cfgId == "-1") {
            //3  明信片：后面跟明信片id，明信片id 填-1表示该城市随机特产明信片
            postCard            = postcardRepo.randomCitySpecial( cid );
            cfgId               = postCard.id;
        }else{
            // 获得明信片 读配置表 一个景点一个明信片 正好景点id同明信片id
            postCard            = travelConfig.Postcard.Get( cfgId );
        }

        let city = travelConfig.City.Get(cid);
        let dateNow         = new Date();
        await this.ctx.model.TravelModel.Postcard.create({
            uid: uid,
            cid: cid,
            country: city.country,
            province: city.province,
            city:city.city,
            ptid:cfgId,
            pscid:"postcard" + uid +new Date().getTime(),
            type: postCard.type,                   //明信片类型
            createDate:dateNow      //创建时间
        });
        this.logger.info(`获得明信片成功,获得${cfgId} x ${1}`);
        let count = await this.ctx.model.TravelModel.Postcard.count({ uid: uid, ptid: cfgId, cid: cid });
        if(count == 1) {
            this.ctx.service.travelService.integralService.add(uid, travelConfig.Parameter.Get(travelConfig.Parameter.POSTCARDPOINT).value);
        }



        // sysGiveLog表记录
        await this.ctx.model.TravelModel.SysGiveLog.create({
            uid:    uid,
            sgid:   "sys" + apis.SystemGift.POSTCARD + uid + new Date().getTime(),                                 //唯一id
            type:   apis.SystemGift.POSTCARD,                                  // 3.明信片
            iid:   cfgId,                         //赠送物品id    金币 1 积分 2 飞机票 11(单人票) ，12(双人票)  其余配表id
            number: 1,                                  //数量
            isAdmin:"0",                                  //管理员赠送  系统送的为0 (这一栏是为了后台手动送道具)
            createDate: dateNow                         //当前时间创建
        });
        return true;
    }

    // 奖励特产的服务
    async speciality(  uid , cid , cfgId , count = 1 ) {

        if(!travelConfig.Speciality.Get(cfgId)){
            this.logger.info("特产不存在" + cfgId);
            this.ctx.session.code       = apis.Code.PARAMETER_NOT_MATCH;
            this.ctx.session.message    = "特产不存在" + cfgId;
            return false;
        }

        let spcount = await this.ctx.model.TravelModel.Speciality.aggregate([
            { $match: { uid: uid } },
            { $group: { _id: "$uid", count: { $sum: "$number" } } },
            { $project: { _id: 0, uid: "$_id", count: 1 } },
            ]);
        this.logger.info(spcount);

        if(spcount[0].count < travelConfig.Parameter.Get(travelConfig.Parameter.BAGLIMIT).value) {
            //加特产
            await this.ctx.model.TravelModel.Speciality.update({uid: uid, spid: cfgId },
                {
                    $set: {
                        uid: uid,
                        spid: cfgId,
                        cid: cid,
                        price: travelConfig.Speciality.Get(cfgId).localprice,
                        createDate: new Date(),
                    },
                    $inc: { number: count },

                },
                { upsert: true });

            //购买记录
            await this.ctx.model.TravelModel.SpecialityBuy.create({
                uid: uid,
                spid: cfgId,
                number: count,
               // numberLeft: sp.number,
                createDate: new Date(),
            });
            this.logger.info(`购买特产成功,获得${cfgId} x ${count}`);

            //syslog 记录
            await this.ctx.model.TravelModel.SysGiveLog.create({
                uid:    uid,
                sgid:   "sys" + uid + apis.SystemGift.SPECIALITY + new Date().getTime(),                                 //唯一id
                type:   apis.SystemGift.SPECIALITY,                                  // 3.明信片
                iid:   cfgId,                              //赠送物品id    金币 1 积分 2 飞机票 11(单人票) ，12(双人票)  其余配表id
                number: count,                                  //数量
                isAdmin:"0",                                  //管理员赠送  系统送的为0 (这一栏是为了后台手动送道具)
                createDate: new Date()                      //当前时间创建
            });
            this.logger.info(`系统赠送特产成功,获得 ${cfgId}  x ${count}`);
            return true;
        }else{
            this.logger.info(`系统赠送特产失败,玩家背包当前特产数量 ${spcount[0].count} 已达上限 `);
            return false;
        }


    }

    // 奖励积分的服务
    async integral( uid , integral  ) {
        await this.ctx.service.travelService.integralService.add(uid, integral);
        return true;
    }
}


module.exports = RewardService;