const Service = require('egg').Service;
const travelConfig = require("../../../sheets/travel");
const utils = require("../../utils/utils");
const apis = require("../../../apis/travel");
const ShortPath = require("../pathService/shortPath");
class TravelService extends Service {
    async fillIndexInfo(info, ui) {
        info.isFirst = ui.isFirst;
        info.gold = ui.items[travelConfig.Item.GOLD];
        let visit = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: ui.uid });
        info.season = await this.ctx.service.publicService.thirdService.getSeason();
        info.weather = 1;
        if (visit && visit.cid) {
            let outw = await this.ctx.service.publicService.thirdService.getWeather(visit.cid);
            info.weather = outw;
            info.location = visit.cid;
        }

        info.playerCnt = await this.app.redis.get("travel_userid");
        info.friends = await this.ctx.service.publicService.friendService.findMyFriends(ui.friendList, info.uid);
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
        if (holiday) {
            cost = cost * multiple;
            dcost = dcost * multiple;
            rcost = rcost * multiple;
            info.holiday = holiday;
        }
        let cid = null;
        let visit = await this.ctx.model.TravelModel.CurrentCity.findOne({uid: info.uid});
        if (visit) {
            cid = visit.cid;
            outw = await this.ctx.service.publicService.thirdService.getWeather(cid);
            // for (let we of travelConfig.weathers) {
            //     if (we.weather == weather) {
            //         outw = we.id;
            //         break;
            //     }
            // }
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


    async visit(info, ui, lastCity, fui) {
        let cid = info.cid;
        let ttype = info.type;
        let cost = {
            //机票钱
            ["items." + travelConfig.Item.GOLD]: (Number(info.cost)) * -1,

        };
        //上个城市效率奖励
        if(lastCity) {
            let tourCity = false;
            let maps = lastCity.roadMap;
            for(let map of maps) {
                if(map.index != -1) {
                    tourCity = true;
                    break;
                }
            }
            try {
                let efficiencyReward = await this.service.travelService.tourService.leavetour(ui);
                lastCity = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: ui.uid });
                info.score = efficiencyReward ? efficiencyReward.score : lastCity.efficiency;
                info.reward = efficiencyReward ? efficiencyReward.reward : lastCity.reward;
            }catch (e) {
                this.logger.error(e);
                info.score = 0;
                info.reward = 0;
            }



            if(ui.isNewPlayer) {
                //本次单飞 并且 上次有规划
                let flyRecord = await this.ctx.model.TravelModel.FlightRecord.findOne({ fid: lastCity.fid });
                if(!fui && tourCity && !flyRecord.isDoublue) {
                    await this.ctx.model.PublicModel.User.update({ uid: ui.uid }, { $set: { isNewPlayer: false } });
                }

            }

            if(lastCity.friend) {
                await this.ctx.model.TravelModel.CurrentCity.update({ uid: lastCity.friend }, { friend: null }, { upsert: true });
            }
        }


        //使用赠送机票
        if (info.type == apis.TicketType.SINGLEPRESENT || info.type == apis.TicketType.DOUBLEPRESENT) {
            this.logger.info("使用赠送机票");
            await this.ctx.model.TravelModel.FlyTicket.update({
                uid: ui.uid,
                id: info.tid,
            }, { $set: { isUse: true } });

        }
        //道具更新
        this.ctx.service.publicService.itemService.itemChange(ui.uid, cost, "flyTicket");
        if (ui.isFirst) {
            this.logger.info("首次飞行");
            await this.ctx.model.PublicModel.User.update({ uid: ui.uid }, { $set: { isFirst: false } });
        }
        if(fui && fui.isFirst) {
            this.logger.info("好友首次飞行");
            await this.ctx.model.PublicModel.User.update({ uid: fui.uid }, { $set: { isFirst: false } });
        }
        //飞行消耗为0 ，为免费飞行或者使用赠送机票
        if (!Number(info.cost) && (ui.isSingleFirst || ui.isDoubleFirst)) {
            //使用的不是免费机票
            if (info.type.indexOf("0") != -1) {
                if (fui && ui.isDoubleFirst) {
                    await this.ctx.model.PublicModel.User.update({ uid: ui.uid }, { $set: { isDoubleFirst: false } });
                } else if (!fui && ui.isSingleFirst) {
                    await this.ctx.model.PublicModel.User.update({ uid: ui.uid }, { $set: { isSingleFirst: false } });
                }
            }

        }


        let flyid = Number(ui.pid + new Date().getTime());
        let flyRecord = {
            uid: ui.uid, //用户ID
            fid: flyid,
            from: lastCity ? lastCity.cid : "初次旅行", //出发地
            destination: cid, //目的地
            ticketType: ttype, //机票类型
            isDoublue: !!fui, //是否双人旅行
            friend: "0",
            cost: Number(info.cost), //花费的金币
            createDate: new Date(),
        };

        let rentItems = {};
        let acceleration = 0;
        let present = false;
        for (let rentItem of travelConfig.shops) {
            if(ui.playTimes && ui.playTimes < travelConfig.Parameter.Get(travelConfig.Parameter.SENDCARTRY).value) {
                if(rentItem.id == travelConfig.Parameter.Get(travelConfig.Parameter.SENDCARID).value) {
                    rentItems[rentItem.id] = 1;
                    acceleration = rentItem.value;
                    present = true;
                    await this.ctx.model.PublicModel.User.update({ uid: info.uid, playTimes: { $gt: 0 } }, { $inc: { playTimes: -1 } })
                }else{
                    rentItems[rentItem.id] = 0;
                }
            }else{
                rentItems[rentItem.id] = 0;
            }
        }
        if(ui.playTimes == travelConfig.Parameter.Get(travelConfig.Parameter.SENDCARTRY).value) {
            await this.ctx.model.PublicModel.User.update({ uid: info.uid, playTimes: { $gt: 0 } }, { $inc: { playTimes: -1 } })
        }
        let currentCity = {
            uid: ui.uid,
            fid: flyid.toString(),
            cid: cid,
            rentItems: rentItems,
            friend: null,
            isInviter: false,
            present: present,
            acceleration: acceleration,
            changeRouteing: false,
            modifyEventDate: null,
            startTime: null,
            events: null,
            photographyCount: travelConfig.Parameter.Get(travelConfig.Parameter.CITYPHOTO).value,
          //  photographySpots: [],
            tourCount: travelConfig.Parameter.Get(travelConfig.Parameter.TOURNUMBER).value,
        };

        let footprint = {
            uid: ui.uid,
            fid: flyid.toString(),
            cid: cid,
            country: travelConfig.City.Get(cid).country,
            province: travelConfig.City.Get(cid).province,
            city: travelConfig.City.Get(cid).city,
          //  scenicspot:"0",
            createDate: new Date(),
        };
        //刷新特产
        this.ctx.service.travelService.specialityService.clearMySpePrice(info.uid);
        //双人旅行
        if (fui) {
            this.logger.info("双人旅行++++++++++++++++++++++++");
            flyRecord.friend = fui.uid;
            currentCity.friend = fui.uid;
            currentCity.isInviter = true;
          //  currentCity.efficiency = 0;
            await this.ctx.model.TravelModel.FlightRecord.create(flyRecord);
            await this.ctx.model.TravelModel.Footprints.create(footprint);
            await this.ctx.model.TravelModel.CurrentCity.update({ uid: currentCity.uid }, currentCity, { upsert: true });



            //更新好友
          //  await this.ctx.model.PublicModel.User.update({ uid: ui.uid }, { $addToSet: { friendList: fui.uid } });
            let fvisit = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: fui.uid });
            if(fvisit) {
                this.logger.info("好友离开城市..............", fui);
                await this.service.travelService.tourService.leavetour(fui);
                if(fvisit.friend) {
                    await this.ctx.model.TravelModel.CurrentCity.update({ uid: fvisit.friend }, { friend: null }, { upsert: true });
                }
            }

            currentCity.present = false;
            for (let rentItem of travelConfig.shops) {
                if(fui.playTimes && fui.playTimes < travelConfig.Parameter.Get(travelConfig.Parameter.SENDCARTRY).value) {
                    if(rentItem.id == travelConfig.Parameter.Get(travelConfig.Parameter.SENDCARID).value) {
                        currentCity.rentItems[rentItem.id] = 1;
                        currentCity.acceleration = rentItem.value;
                        currentCity.present = true;
                        await this.ctx.model.PublicModel.User.update({ uid: fui.uid, playTimes: { $gt: 0 } }, { $inc: { playTimes: -1 } })
                    }else{
                        currentCity.rentItems[rentItem.id] = 0;
                    }
                }else{
                    currentCity.rentItems[rentItem.id] = 0;
                }

            }
            if(fui.playTimes == travelConfig.Parameter.Get(travelConfig.Parameter.SENDCARTRY).value) {
                await this.ctx.model.PublicModel.User.update({ uid: fui.uid, playTimes: { $gt: 0 } }, { $inc: { playTimes: -1 } })
            }
            flyRecord.uid = fui.uid;
            flyRecord.friend = ui.uid;
            flyRecord.from = fvisit ? fvisit.cid : "初次旅行";
            currentCity.uid = fui.uid;
            currentCity.friend = ui.uid;
            currentCity.isInviter = false;
            footprint.uid = fui.uid;
           // await this.ctx.model.PublicModel.User.update({ uid: fui.uid }, { $addToSet: { friendList: ui.uid } });

            this.ctx.service.travelService.specialityService.clearMySpePrice(fui.uid);
        }

        //添加飞行记录
        await this.ctx.model.TravelModel.FlightRecord.create(flyRecord);
        //添加足迹
        await this.ctx.model.TravelModel.Footprints.create(footprint);
        //更新玩家所在地
        await this.ctx.model.TravelModel.CurrentCity.update({ uid: currentCity.uid }, currentCity, { upsert: true });

    }


    async getTravelLog(info, ui) {
        let page = info.page ? Number(info.page) : 1;
        let limit = info.length ? Number(info.length) : travelConfig.Parameter.Get(travelConfig.Parameter.COUNTLIMIT).value;
        let allLogs = await this.ctx.model.TravelModel.Footprints.aggregate([
            { $match: { uid: ui.uid } },
            { $group: { _id: { year: { $dateToString: { format: "%Y", date: "$createDate" } }, fid: "$fid", date: "$createDate", city: "$city" }, scenicSpots: { $push: "$scenicspot" } } },
            { $sort: { "_id.date": -1 } },
            { $group: { _id: { year: "$_id.year", fid: "$_id.fid", city: "$_id.city" }, scenicSpots: { $push: { time: "$_id.date", spots: "$scenicSpots" } } } },
            { $sort: { "_id.fid": -1 } },
            { $project: { _id: 0, year: "$_id.year", fid: "$_id.fid", city: "$_id.city", scenicSpots: 1 } },
        ]).sort({ year: -1 });
        //this.logger.info(JSON.stringify(allLogs));
        let outLog = [];
        let year = new Date().getFullYear();
        //allLogs = allLogs.slice((page - 1) * limit, page * limit);
        for(let i = 0; i < allLogs.length; i++) {
         //   this.logger.info(allLogs[i].fid);
           // let fly = await this.ctx.model.TravelModel.FlightRecord.findOne({ fid: allLogs[i].fid });
          //  if(fly) {
                let onelog = {
                   // city: travelConfig.City.Get(fly.destination).city,
                 //   city: allLogs[i].city,
                 //   time: fly.createDate.format("yyyy-MM-dd"),
                    // year : allLogs[i].year,
                };
                let spots = [];
                let onespot = {
                    spots: [],
                };
                let arrivetime = null;
                let scenicSpots = allLogs[i].scenicSpots;
                scenicSpots = utils.multisort(scenicSpots, (a, b) => a.time - b.time);
               // this.logger.info(scenicSpots);
                for(let spot of scenicSpots) {
                    let time = spot.time.format("yyyy-MM-dd");
                   // this.logger.info(spot.spots[0]);
                    if(!spot.spots[0]) {
                        onelog.time = time;
                        onelog.city = allLogs[i].city;
                        arrivetime = time;
                        onespot.time = time;
                        spots.push(onespot);
                        continue;
                    }

                 //   this.logger.info(time, arrivetime);
                    if(time != arrivetime) {
                        onespot = {
                            time: time,
                            spots: spot.spots,
                        };
                        arrivetime = time;
                        spots.push(onespot);
                    }else{
                        onespot.spots.push(spot.spots[0]);
                    }

                }

                onelog.scenicSpots = spots;
                //  this.logger.info(onelog);

                if(i == 0) {
                    onelog.year = allLogs[i].year;
                    year = allLogs[i].year
                }else{
                    if(year != allLogs[i].year) {
                        onelog.year = allLogs[i].year;
                        year = allLogs[i].year
                    }else{
                        if(outLog[i - 1].year) {
                            delete outLog[i - 1].year;
                        }
                        onelog.year = allLogs[i].year;
                        year = allLogs[i].year
                    }
                }
                outLog.push(onelog);
          //  }
        }
        info.allLogs = outLog.slice((page - 1) * limit, page * limit).reverse();
    }

    async getCityCompletionList(info, ui) {
        let provinces = travelConfig.finds;
        let data = [];
        let userfootprints = await this.ctx.model.TravelModel.Footprints.aggregate([
            { $match: { uid: ui.uid } },
            { $group: { _id: "$province", citys: { $addToSet: { cid: "$cid" } } } },
            { $project: { _id: 0, province: "$_id", citys: 1 } },
        ]);
       // this.logger.info(userfootprints);
        let userProvinces = new Set();
        let userProCitys = new Map();
        let totalProvinces = new Set();
        let totalFind = new Map();
        for(let userProvince of userfootprints){
            //用户去过的省
            userProvinces.add(userProvince.province);
            //用户去过的该省的城市
            let citys = [];
            for(let city of userProvince.citys) {
                citys.push(city.cid);
            }
            userProCitys.set(userProvince.province, citys)
        }
        for(let province of provinces) {
            totalProvinces.add(province.province);
            totalFind.set(province.province, province.id);
        }
        //按顺序查找用户去过的省
        let intersectPro = new Set([ ...totalProvinces ].filter(x => userProvinces.has(x)));
        this.logger.info(intersectPro);
        for(let inPro of intersectPro) {
            let proFind = totalFind.get(inPro);
            let province = travelConfig.Find.Get(proFind);
            let provencePer = {
                proLetter: province.pword,
                proName: province.province,
            };
            let pcityids = province.cityid;
            let proCityId = new Set(pcityids);
            let userProCityId = new Set(userProCitys.get(inPro));
          //  this.logger.info(proCityId);
          //  this.logger.info(userProCityId);
            //按顺序查找用户去过的城市
            let intersectCity = new Set([ ...proCityId ].filter(x => userProCityId.has(x.toString())));

            let cityPs = [];
            for(let cityid of intersectCity) {
                let index = pcityids.findIndex((n) => n == cityid);
                this.logger.info("城市 " + cityid);
                this.logger.info("顺序 ", index);
               // this.logger.info("城市列表", province.city);
                let cityPer = {
                    cityId: cityid,
                    cityname: province.city[index],
                };
                let cid = cityid.toString();
                let cityCompletionDegree = await this.ctx.service.travelService.rankService.getUserCityCompletionDegree(info.uid, cid);
                cityPer.cityper = cityCompletionDegree ? cityCompletionDegree.completionDegree : 0;
                this.logger.info(cityCompletionDegree);
                cityPs.push(cityPer);
            }
            provencePer.citys = cityPs;
            data.push(provencePer)
        }
        info.data = data;
    }

}


module.exports = TravelService;