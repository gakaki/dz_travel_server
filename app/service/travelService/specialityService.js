//攻略相关数据逻辑
const Service = require('egg').Service;
const sheets = require('../../../sheets/travel');
const apis = require('../../../apis/travel');

class SpecialityService extends Service {
    async cityspes(info) {
        let cityCfg = sheets.City.Get(info.cityId);
        if (!cityCfg) {
            this.logger.info(`未找到id为${info.cityId}的city`);
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            return;
        }

        let specs = await this.ctx.model.TravelModel.Speciality.find({uid: info.ui.uid})
        let nowNum = 0;
        specs.forEach(v => {
            nowNum += v.number
        })
        let baglimit = sheets.Parameter.Get(sheets.Parameter.BAGLIMIT).value;
        let restNum = baglimit - nowNum;
        info.restNum = restNum;

        //read specialitys
        let spes = await Promise.all(cityCfg.speciality.map(async (id) => {
            let o = sheets.Speciality.Get(id);
            let sps = await this.ctx.model.TravelModel.Speciality.findOne({uid: info.ui.uid, spid: id});

            if (o) {
                let s = new apis.Speciality();
                s.name = o.specialityname;
                s.desc = '购买特产后可前往其他城市高价售卖赚取金币';
                s.img = o.picture;
                s.propId = o.id;
                s.price = o.localprice;
                if (sps) {
                    let canBuy = o.limit;
                    if (o.limit != -1) {
                        canBuy = Math.max(o.limit - sps.number, 0);
                    }
                    s.limitNum = canBuy;
                } else {
                    s.limitNum = o.limit
                }
                return s;
            }
            else {
                this.logger.warn(`找不到id为${id}的speciality`)
                return null
            }
        })
        )
        info.specialtys = spes.filter(s => s); // filter not null
    }

    async myspes(info) {
        let ui = info.ui;
        let now = new Date();
        let speModel = this.ctx.model.TravelModel.Speciality;
        let updateInterval = sheets.Parameter.Get(sheets.Parameter.REFRESHSHOP).value * 3600 * 1000;//配表转毫秒
        // updateInterval = 6000//test set to 1 minute

        let curCity = await this.ctx.model.TravelModel.CurrentCity.findOne({uid: ui.uid});
        info.specialtys = [];

        let spes = await speModel.find({uid: ui.uid});
        await Promise.all(spes.map(s => {
            return new Promise(async resolve => {
                let needFreshPrice = false;
                let cfg = sheets.Speciality.Get(s.spid);

                if (s.sellPrice > 0) {
                    //有价格，则检测是否需要更新价格
                    let pDate = s.sellPriceDate;
                    if (now.getTime() - pDate.getTime() > updateInterval) {
                        //need fresh
                        needFreshPrice = true;
                    }
                    else {
                        fillRes(info.specialtys, cfg, s);
                        resolve();
                    }
                }
                else {
                    needFreshPrice = true;
                }

                if (needFreshPrice) {

                    let curCityId = curCity ? curCity.cid : 1;//等待取真实的当前所在城市Id...., 如果在特产出产地卖出，则售价为买入价的九折（折扣读表）
                 //   this.logger.info(curCity);
                 //   this.logger.info(s);
                    let price = 0;
                    if (s.cid == curCityId) {
                        price = parseInt(s.price * sheets.Parameter.Get(sheets.Parameter.LOCALSALE).value / 100);
                    } else {
                        price = cfg.sellingprice[Math.floor(Math.random() * cfg.sellingprice.length)];
                    }
                    this.logger.info(price);
                    s.sellPrice = price;
                    s.sellPriceDate = now;

                    await speModel.update({uid: s.uid, spid: s.spid}, {$set: {sellPrice: price, sellPriceDate: now}});
                    fillRes(info.specialtys, cfg, s);
                    resolve();
                }
            })
        }));

        function fillRes(arr, cfg, s) {
            let o = new apis.MySpe();
            o.propId = s.spid;
            o.name = cfg.specialityname;
            o.img = cfg.picture;
            o.price = cfg.localprice;
            o.sellPrice = s.sellPrice;
            o.num = s.number;

            arr.push(o);
        }


    }

    //每次进入一个新城市游玩时，调用此接口,将自己背包里的特产出售价格清零
    async clearMySpePrice(uid) {
        let speModel = this.ctx.model.TravelModel.Speciality;
        await speModel.update({uid}, {$set: {sellPrice: 0}}, {multi: true});
    }

    async buy(info) {
        let ui = info.ui;
        let cfg = sheets.Speciality.Get(info.propId);
        if (!cfg) {
            this.logger.info(`未找到id为${info.propId}的speciality`);
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            return;
        }

        //金币是否够
        let cost = info.count * cfg.localprice;
        if (ui.items[sheets.Item.GOLD] < cost) {
            info.code = apis.Code.NEED_MONEY;
            this.logger.info('购买特产失败，金币不足');
            return;
        }

        //特产背包上限
        let baglimit = sheets.Parameter.Get(sheets.Parameter.BAGLIMIT).value;
        let hasCnt = 0;
        let spCnt = 0;//同id的已经拥有的数量
        let sps = await this.ctx.model.TravelModel.Speciality.find({uid: ui.uid});
        if (sps && sps.length) {
            hasCnt = sps.reduce((total, record) => {
                if (record.spid == info.propId) {
                    spCnt = record.number;
                }
                return total + record.number;
            }, 0);
        }
        if (hasCnt + parseInt(info.count) > baglimit) {
            info.code = apis.Code.BAG_FULLED;
            this.logger.info(`购买特产失败，背包已满`);
            return;
        }
        if (cfg.limit > 0 && spCnt + parseInt(info.count) > cfg.limit) {
            info.code = apis.Code.SPE_LIMIT;
            this.logger.info(`购买特产失败，物品限购`);
            return;
        }

        //扣钱
        await this.ctx.service.publicService.itemService.itemChange(ui.uid, {["items." + sheets.Item.GOLD]: -cost}, 'specialityBuy');
        ui = info.ui = await this.ctx.model.PublicModel.User.findOne({uid: ui.uid});
        //加特产
        await this.ctx.model.TravelModel.Speciality.update(
            {uid: ui.uid, spid: cfg.id},
            {
                $set: {
                    cid: cfg.cityid,
                    uid: ui.uid,
                    spid: cfg.id,
                    price: cfg.localprice,
                    createDate: new Date(),
                },
                $inc: {number: parseInt(info.count)},
            },
            {upsert: true});
        //购买记录
        await this.ctx.model.TravelModel.SpecialityBuy.create({
            uid: ui.uid,
            spid: cfg.id,
            number: parseInt(info.count),
            createDate: new Date(),
        });
        this.logger.info(`购买特产成功,获得${cfg.specialityname} x ${info.count}`);

        info.goldNum = ui.items[sheets.Item.GOLD];

    }

    async sell(info) {
        let ui = info.ui;
        let cfg = sheets.Speciality.Get(info.propId);
        if (!cfg) {
            this.logger.info(`未找到id为${info.propId}的speciality`)
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            return;
        }

        let sp = await this.ctx.model.TravelModel.Speciality.findOne({uid: ui.uid, spid: info.propId});
        if (!sp) {
            this.logger.info(`背包中未找到id为${info.propId}的特产`);
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            return;
        }
        if (sp.number < info.count) {
            this.logger.info(`卖出特产失败，数量${info.count}超出拥有数${sp.number}`);
            info.code = apis.Code.PARAMETER_NOT_MATCH;
            return;
        }

        let money = sp.sellPrice * info.count;

        //加钱
        await this.ctx.service.publicService.itemService.itemChange(ui.uid, { ["items." + sheets.Item.GOLD]: money }, 'specialitySell');
        ui = info.ui = await this.ctx.model.PublicModel.User.findOne({uid: ui.uid});
        //扣特产
        if (sp.number == info.count) {
            await this.ctx.model.TravelModel.Speciality.remove({uid: ui.uid, spid: cfg.id});
        }
        else {
            await this.ctx.model.TravelModel.Speciality.update({
                uid: ui.uid,
                spid: cfg.id,

            }, {$inc: {number: -info.count}});
        }
        //卖出记录
        await this.ctx.model.TravelModel.SpecialitySell.create({
            uid: ui.uid,
            spid: cfg.id,
            number: info.count,
            // numberLeft: sp.number - info.count,
            createDate: new Date()
        });
        this.logger.info(`卖出特产成功,获得金币 x ${money}`);

        info.goldNum = ui.items[sheets.Item.GOLD];

    }
}

module.exports = SpecialityService;