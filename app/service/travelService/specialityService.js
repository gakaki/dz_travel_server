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

       //read specialitys
       let spes = cityCfg.speciality.map(id => {
          let o = sheets.Specialty.Get(id);
          if (o) {
             let s = new apis.Specialty();
             s.name = o.specialityname;
             s.desc = '购买特产后可前往其他城市高价售卖赚取金币';
             s.img = o.picture;
             s.propId = o.id;
             s.price = o.localprice;
             return s;
          }
          else {
             this.logger.warn(`找不到id为${id}的speciality`)
          }
       })

       info.specialtys = spes;
   }

   async myspes(info) {
       let spes = await this.ctx.model.TravelModel.Specialty.find({uid: info.ui.uid});
       info.specialtys = spes.map(s => {
          let o = new apis.MySpe();
          let cfg = sheets.Speciality.Get(o.spid);
          o.propId = s.spid;
          o.name = s.specialityname;
          o.img = cfg.picture;
          o.price = cfg.localprice;
          o.sellPrice = cfg.sellingprice;
          o.num = s.number;
          
          return o;
       });
       
       info.specialtys = spes;
   }

   async buy(info){
       let ui = info.ui;
       let cfg = sheets.Speciality.Get(info.propId);
       if (!cfg) {
          this.logger.info(`未找到id为${info.propId}的speciality`)
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
       let hasCnt = await this.ctx.model.TravelModel.Specialty.find({uid: ui.uid}).reduce((total, record) => {
          return total + record.number;
       }, 0);
       if (hasCnt >= baglimit) {
          info.code = apis.Code.BAG_FULLED;
          this.logger.info(`购买特产失败，背包已满`);
          return;
       }

       //扣钱
       await this.ctx.service.publicService.itemService.itemChange(ui.uid, {["items." + sheets.Item.GOLD]: -cost}, 'travel');
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

   }

   async sell(info){
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

       let money = cfg.sellingprice * info.count;

       //加钱
       await this.ctx.service.publicService.itemService.itemChange(ui.uid, {["items." + sheets.Item.GOLD]: money}, 'travel');
       //扣特产
       if (sp.number == info.count) {
           await this.ctx.model.TravelModel.Speciality.remove({uid: ui.uid, spid: cfg.id});
       }
       else {
           await this.ctx.model.TravelModel.Speciality.update({uid: ui.uid, spid: cfg.id}, {$inc: {number: -info.count}});
       }
       //卖出记录
       await this.ctx.model.TravelModel.SpecialitySell.create({
           uid: ui.uid,
           spid: cfg.id,
           number: info.count,
           numberLeft: sp.number - info.count,
           createDate: new Date()
       });
       this.logger.info(`卖出特产成功,获得金币 x ${money}`);

       info.goldNum = ui.items[sheets.Item.GOLD];

   }
}

module.exports = SpecialityService;