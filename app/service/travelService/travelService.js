const Service = require('egg').Service;
const travelConfig = require("../../../sheets/travel");
const utils = require("../../utils/utils");
const apis = require("../../../apis/travel");

class TravelService extends Service {
    async fillIndexInfo(info, ui) {
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

    async selectCity(info, ui) {
        info.gold = ui.items[travelConfig.Item.GOLD];
      //  info.isFirst = ui.isFirst;
        info.isSingleFirst = ui.isSingleFirst;
        info.isDoubleFirst = ui.isDoubleFirst;
        let outw = 1;
        let holiday = this.ctx.service.publicService.thirdService.getHoliday();
        let cost = travelConfig.Parameter.Get(travelConfig.Parameter.COMMONTICKETPRICE).value;
        let dcost = travelConfig.Parameter.Get(travelConfig.Parameter.DOUBLETICKETPRICE).value;
        let rcost = travelConfig.Parameter.Get(travelConfig.Parameter.RANDOMTICKETPRICE).value;
        let multiple = travelConfig.Parameter.Get(travelConfig.Parameter.BUSYSEASON).value;
        if (holiday.length > 0) {
            cost = cost * multiple;
            dcost = dcost * multiple;
            rcost = rcost * multiple;
            info.holiday = holiday[0];
        }
        let cid = null;
        let visit = await this.ctx.model.TravelModel.CurrentCity.findOne({uid: info.uid});
        if (visit) {
            cid = visit.cid;
            let weather = await this.ctx.service.publicService.thirdService.getWeather(travelConfig.City.Get(cid).city);
            for (let we of travelConfig.weathers) {
                if (we.weather == weather) {
                    outw = we.id;
                    break;
                }
            }
            info.location = cid;
        }
        if (ui.isSingleFirst) {
            cost = 0;
            rcost = 0;
        }
        if (ui.isDoubleFirst) {
            dcost = 0;
        }
        if (info.type == apis.TicketType.RANDOMBUY) {
            info.cost = rcost;
        } else if (info.type == apis.TicketType.SINGLEBUY) {
            info.cost = cost;
            info.doubleCost = dcost;
        } else if (info.type == apis.TicketType.SINGLEPRESENT) {
            info.cost = 0;
            info.doubleCost = dcost;
        }else if(info.type == apis.TicketType.DOUBLEPRESENT){
            info.cost = cost;
            info.doubleCost = 0;
        }
        if (info.type == apis.TicketType.RANDOMBUY) {
            let randomcity = await this.ctx.service.publicService.thirdService.getRandomTicket(ui.uid, cid);
            this.logger.info("随机城市 " + randomcity);
            info.cid = randomcity
        }

        info.weather = outw;
        info.season = await this.ctx.service.publicService.thirdService.getSeason();
        info.date = new Date().format("yyyy-MM-dd");

    }


    async visit(info, ui) {
        let cid = info.cid;
        let fid = info.partnerUid;
        let ttype = info.type;


        let visit = await this.ctx.model.TravelModel.CurrentCity.findOne({uid: ui.uid});
        let cost = {
            ["items." + ttype]: -1,
            ["items." + travelConfig.Item.GOLD]: (Number(info.cost)) * -1
        };
        //使用赠送机票
        if (info.type == apis.TicketType.SINGLEPRESENT || info.type == apis.TicketType.DOUBLEPRESENT) {
            this.logger.info("使用赠送机票");
            await this.ctx.model.TravelModel.FlyTicket.update({
                uid: ui.uid,
                id:info.tid,
            },{$set:{isUse:true}});

        }
        //道具更新
        await this.ctx.model.PublicModel.User.update({
            uid: ui.uid,
            ["items." + travelConfig.Item.GOLD]: {$gt: 0}
        }, {$inc: {["items." + travelConfig.Item.GOLD]: (Number(info.cost)) * -1}});
        this.ctx.service.publicService.itemService.itemChange(ui, cost);
        if (ui.isFirst){
            this.logger.info("首次飞行");
            await this.ctx.model.PublicModel.User.update({uid: ui.uid}, {$set: {isFirst: false}});
        }
        //飞行消耗为0 ，为免费飞行或者使用赠送机票
        if (!Number(info.cost) && (ui.isSingleFirst || ui.isDoubleFirst)) {
            //使用的不是免费机票
            if (info.type.indexOf("0") != -1 ) {
                if (fid && ui.isDoubleFirst) {
                    await this.ctx.model.PublicModel.User.update({uid: ui.uid}, {$set: {isDoubleFirst: false}});
                } else if (!fid && ui.isSingleFirst) {
                    await this.ctx.model.PublicModel.User.update({uid: ui.uid}, {$set: {isSingleFirst: false}});
                }
            }

        }
        let flyid = "fly"+new Date().getTime();
        let flyRecord = {
            uid: ui.uid,      //用户ID
            fid:flyid,
            from: visit ? visit.cid : "初次旅行",           //出发地
            destination: cid,   //目的地
            ticketType: ttype,//机票类型
            isDoublue: fid ? true : false,//是否双人旅行
            cost: Number(info.cost),                        //花费的金币
            createDate: new Date()
        };
        let rentItems = {};
        for (let rentItem of travelConfig.shops) {
            rentItems[rentItem.id] = 0;
        }
        let currentCity = {
            uid: ui.uid,
            fid:flyid,
            cid: cid,
            rentItems: rentItems
        };
        //双人旅行
        if (fid) {
            flyRecord.friend = fid;
            currentCity.friend = fid;
            await this.ctx.model.TravelModel.FlightRecord.create(flyRecord);
            await this.ctx.model.TravelModel.CurrentCity.update({uid: ui.uid}, currentCity, {upsert: true});
            //更新好友
            await this.ctx.model.PublicModel.User.update({uid: ui.uid}, {$addToSet: {friendsList: fid}});
            let fvisit = await this.ctx.model.TravelModel.CurrentCity.findOne({uid: fid});
            flyRecord.uid = fid;
            flyRecord.friend = ui.uid;
            flyRecord.from = fvisit ? fvisit.cid : "初次旅行";
            currentCity.uid = fid;
            currentCity.friend = ui.uid;
            await this.ctx.model.PublicModel.User.update({uid: fid}, {$addToSet: {friendsList: ui.uid}});

        }

        //添加飞行记录
        await this.ctx.model.TravelModel.FlightRecord.create(flyRecord);
        //更新玩家所在地
        await this.ctx.model.TravelModel.CurrentCity.update({uid: ui.uid}, currentCity, {upsert: true})
    }


    async getTravelLog(info, ui) {
        let page = info.page ? Number(info.page) : 1;
        let limit = info.length ? Number(info.length) : travelConfig.Parameter.Get(travelConfig.Parameter.COUNTLIMIT).value;
        let allLogs = await this.ctx.model.TravelModel.Footprints.aggregate([
            {$match: {"uid": ui.uid}},
            {$group:{_id:{year: { $dateToString: { format: "%Y", date: "$createDate" }},fid:"$fid",date:{ $dateToString: { format: "%Y-%m-%d", date: "$createDate" } } },scenicSpots:{$push:{spots:"$scenicspot"}}}},
            {$sort:{"_id.date":1}},
            {$group:{_id:{year: "$_id.year",fid:"$_id.fid" },scenicSpots:{$push:{time:"$_id.date",spots:"$scenicSpots"}}}},
            {$sort:{"_id.fid":1}},
            {$project:{_id:0,year:"$_id.year",fid:"$_id.fid",scenicSpots:1}},
        ]).sort({year:1}).skip((page - 1) * limit).limit(limit);
        let outLog = [];
        let year = new Date().getFullYear();
        for(let i = 0;i<allLogs.length;i++){
            let fly = await this.ctx.model.TravelModel.FlightRecord.findOne({fid:allLogs[i].fid});
            let onelog = {
                city: travelConfig.City.Get(fly.destination).city,
                time: fly.createDate.format("yyyy-MM-dd"),
                scenicSpots:allLogs[i].scenicSpots,
               // year : allLogs[i].year,
            };

            if(i==0){
                onelog.year = allLogs[i].year;
                year = allLogs[i].year
            }else{
                if(year != allLogs[i].year){
                    onelog.year = allLogs[i].year;
                    year = allLogs[i].year
                }
            }
            outLog.push(onelog);
        }


        //
        // let sortList = utils.multisort(outLog,
        //     (a, b) => new Date(a["time"]) - new Date(b["time"]),
        // );



        info.allLogs = outLog;
    }

    async getCityCompletionList(info,ui){
        let provinces = travelConfig.finds;
        let data =[];
        let userfootprints = await this.ctx.model.TravelModel.Footprints.aggregate([
            {$match:{uid:ui.uid}},
            {$group:{_id:"$province",citys:{$addToSet:{cid:"$cid"}}}},
            {$project:{_id:0,province:"$_id",citys:1}}
        ]);
        this.logger.info(userfootprints);
        let userProvinces = new Set();
        let userProCitys = new Map();
        let totalProvinces = new Set();
        let totalFind = new Map();
        for(let userProvince of userfootprints){
            //用户去过的省
            userProvinces.add(userProvince.province);
            //用户去过的该省的城市
            let citys =[];
            for(let city of userProvince.citys){
                citys.push(city.cid);
            }
            userProCitys.set(userProvince.province,citys)
        }
        for(let province of provinces){
            totalProvinces.add(province.province);
            totalFind.set(province.province,province.id);
        }
        //按顺序查找用户去过的省
        let intersectPro  = new Set([...totalProvinces].filter(x => userProvinces.has(x)));
        this.logger.info(intersectPro);
        for(let inPro of intersectPro){
            let proFind =totalFind.get(inPro);
            let province = travelConfig.Find.Get(proFind);
            let provencePer = {
                proLetter : province.pword,
                proName : province.province
            };
            let pcityids = province.cityid;
            let proCityId = new Set(pcityids);
            let userProCityId = new Set(userProCitys.get(inPro));
            this.logger.info(proCityId);
            this.logger.info(userProCityId);
            //按顺序查找用户去过的城市
            let intersectCity = new Set([...proCityId].filter(x => userProCityId.has(x.toString())));

            let cityPs = [];
            for(let cityid of intersectCity){
                let index = pcityids.findIndex((n) => n == cityid);
                this.logger.info("城市 "+cityid);
                this.logger.info("顺序 " ,index);
                this.logger.info("城市列表", province.city);
                let cityPer ={
                    cityname : province.city[index]
                };
                let cid = cityid.toString();
                //完成度计算  (用户到达的景点数+ 触发的事件数+ 收集明星片数）/ (总景点数 + 总事件数 + 总明信片数)
                let userScenicspots = await this.ctx.model.TravelModel.Footprints.aggregate([
                    {$match:{uid:ui.uid,cid:cid}},
                    {$group:{_id:"$scenicspot"}},
                ]);
                this.logger.info(userScenicspots);
                let userEvents = await this.ctx.model.TravelModel.TravelEvent.aggregate([
                    {$match:{uid:ui.uid,cid:cid}},
                    {$group:{_id:"$eid"}}
                ]);
                let userPostcards = await this.ctx.model.TravelModel.Postcard.aggregate([
                    {$match:{uid:ui.uid,cid:cid}},
                    {$group:{_id:"$ptid"}}
                ]);
                let totalCitys = travelConfig.citys;
                let totalScenicspots = 0;
                let totalEvents = 0;
                let totalPostcards = 0;
                for(let city of totalCitys){
                    if(city.id == cid){
                        this.logger.info(city);
                        totalScenicspots = city.scenicspot.length;
                        totalEvents = city.eventnum;
                        totalPostcards = city.postcardnum;
                        break;
                    }
                }
                this .logger.info("城市 "+ cid);
                let userPro = userScenicspots.length + userEvents.length + userPostcards.length;
                this.logger.info("玩家该城市进度 " + userPro);
                let totalPro = totalScenicspots + totalEvents + totalPostcards;
                this.logger.info("该城市总进度 " + totalPro);
                let cp = ((userPro/totalPro)*100).toFixed(2);
                this.logger.info("完成度 " + cp);
                cityPer.cityper = cp;
                cityPs.push(cityPer);
            }
            provencePer.citys=cityPs;
            data.push(provencePer)
        }
        info.data = data;
    }

}


module.exports = TravelService;