const Service = require('egg').Service;
const travelConfig = require("../../../sheets/travel");
const utils = require("../../utils/utils");
const apis = require('../../../apis/travel');

class PlayerService extends Service {

    async showPlayerInfo(info, ui) {
        let visit = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: ui.uid });

     //   let total = await this.app.redis.get("travel_userid");
     //   let readyMatch = 0;

        let addScore = await this.ctx.model.PublicModel.UserItemCounter.findOne({ uid: ui.uid, index: travelConfig.Item.POINT });
        let postCards = await this.ctx.model.TravelModel.Postcard.aggregate([
            { $match: { uid: ui.uid } },
            { $group: { _id: "$ptid" } },
        ]);
        let comment = await this.ctx.model.TravelModel.Comment.count({ uid: ui.uid });
        let likes = await this.ctx.model.TravelModel.Comment.aggregate([{ $match: { uid: ui.uid } }]).group({ _id: "$uid", likes: { $sum: "$likes" } });
        let specialty = await this.ctx.model.TravelModel.SpecialityBuy.aggregate([
            { $match: { uid: ui.uid } },
            { $group: { _id: "$uid", number: { $sum: "$number" } } },
            ]);

        //this.logger.info(specialty);

        if(visit) {
           await this.ctx.service.travelService.tourService.queryTaskProgress(ui.uid, visit);
           ui = await this.ctx.model.PublicModel.User.findOne({ uid: ui.uid })
        }
     //   let playerFootprints = await this.ctx.service.travelService.rankService.getUserFoot(info.uid);
     //   let totalArrive = playerFootprints ? playerFootprints.lightCityNum : 0;
     //    for(let i = 0; i < totalArrive; i++) {
     //        let key = "lightCity" + i;
     //        readyMatch += Number(await this.app.redis.get(key));
     //    }
      //  let overMatch = parseFloat(((readyMatch / total) * 100).toFixed(1));
        info.info = {
            uid: ui.uid,
            nickName: ui.nickName,
            avatarUrl: ui.avatarUrl,
            gender: ui.gender,
          //  totalArrive: totalArrive,
         //   overmatch: overMatch,
            city: visit ? travelConfig.City.Get(visit.cid).city : "初次旅行",
            province: visit ? travelConfig.City.Get(visit.cid).province : "初次旅行",
            country: visit ? travelConfig.City.Get(visit.cid).country : "初次旅行",
            online: ui.online,
            items: ui.items,
            rentItems: visit ? visit.rentItems : {},
            friends: ui.friendList,
            otherUserInfo: {
                totalIntegral: addScore ? addScore.addup : 0,
                mileage: ui.mileage,
                postcard: postCards.length,
                comment: comment,
                likeNum: likes.length ? likes[0].likes : 0,
                specialty: specialty.length ? specialty[0].number : 0,
            },
        }

    }


    async travelFootprint(info, ui) {
        let totalCitys = travelConfig.citys.length;
        this.logger.info("总城市 " + totalCitys);
        let playerFootprints = await this.ctx.service.travelService.rankService.getUserFoot(info.uid);
        let totalArrive = playerFootprints ? playerFootprints.lightCityNum : 0;
        let provinces = await this.ctx.model.TravelModel.CityLightLog.aggregate([
            { $match: { uid: info.uid, lighten: true } },
            { $group: { _id: "$province" } },
        ]);

        this.logger.info("用户去过的城市 " + totalArrive);
        let totalArrivePercent = parseFloat(((totalArrive / totalCitys) * 100).toFixed(1));
        this.logger.info("城市百分比 " + totalArrivePercent);
        info.items = ui.items;
        info.userInfo = {
            uid: ui.uid,
            nickName: ui.nickName,
            avatarUrl: ui.avatarUrl,
        };
        info.reachrovince = provinces.length;
        info.totalArrive = totalArrive;
        info.totalArrivePercent = totalArrivePercent;

        let selfCompletionDegree = await this.ctx.service.travelService.rankService.getUserCompletionDegree(ui.uid);
        info.travelPercent = selfCompletionDegree ? selfCompletionDegree.completionDegree : 0;

    }

    async traveledPlaces(info, ui) {
        let lightenCitys = await this.ctx.model.TravelModel.CityLightLog.find({ uid: ui.uid, lighten: true });
        let provincesSet = new Set();
        let citySet = new Set();
        for(let lightenCity of lightenCitys) {
            provincesSet.add(lightenCity.province);
            let city = travelConfig.City.Get(lightenCity.cid);
            citySet.add(city);
        }
        info.provinces = Array.from(provincesSet);
        info.citys = Array.from(citySet);

    }

    async showFlyTicket(info, ui) {
        let tickets = await this.ctx.model.TravelModel.FlyTicket.find({ uid: ui.uid, isUse: false });
        let flyTickets = [];
        this.logger.info("赠送机票 " + tickets);
        for(let ticket of tickets) {
            let flyTicket = {
                tid: ticket.id,
                cid: ticket.cid,
                type: ticket.flyType,
            };
            flyTickets.push(flyTicket);
        }
        info.ticket = flyTickets;
        //当前为双人旅行时，自动取消组队
        let visit = await this.ctx.model.TravelModel.CurrentCity.findOne({ uid: info.uid });
        if(visit) {
            if(visit.friend) {
                await this.ctx.model.TravelModel.CurrentCity.update({ uid: [ info.uid, visit.friend ] }, { $set: { friend: null } }, { multi: true });
            }
        }
    }

    async getMessage(info, ui, type) {
        let page = Number(info.page) ? Number(info.page) : 1;
        let limit = Number(info.limit) ? Number(info.limit) : travelConfig.Parameter.Get(travelConfig.Parameter.COUNTLIMIT).value;
        this.logger.info(`当前页码 ：${page} ,当前限制数 ${limit}`);
        let msgs = await this.ctx.service.travelService.msgService.unreadMsgs(ui.uid, type, page, limit);
      //  this.logger.info(msgs);
        let messages = [];
        for(let msg of msgs) {
            let message = {
                 mid: msg.mid,
                type: msg.type,
                title: msg.title,
                date: msg.date.format("yyyy-MM-dd"),
                content: msg.content,
            };
            messages.push(message);
         // await this.ctx.model.TravelModel.UserMsg.update({mid:msg.mid},{$set:{isRead:true}});
        }
      //  this.logger.info(messages);
        info.messages = messages
    }

    async clearMsg(info, ui, msg) {
       let r = await this.ctx.model.TravelModel.UserMsg.update({ createDate: { $lte: msg.createDate } }, { $set: { isRead: true } }, { multi: true });
        this.logger.info(r);
    }

    async checkMsgCnt(info, ui) {
        let count = await this.ctx.service.travelService.msgService.unreadMsgCnt(ui.uid);
        this.logger.info("返回的未读消息 " + count);
        info.unreadMsgCnt = count;
    }

    async setRealInfo(info, ui) {
       await this.ctx.model.PublicModel.User.update({ uid: ui.uid }, {
            $set: {
                name: info.name,
                birth: info.birthday,
                mobile: info.phone,
                address: info.address,
            },
        });

       //收货地址单独存一份，以便于以后扩展为多个收货地址
       await this.ctx.model.TravelModel.Address.update({ uid: ui.uid }, {
           $set: {
               name: info.name,
               tel: info.phone,
               addr: info.address,
           },
       }, { upsert: true });

        info.realInfo = {
            uid: ui.uid,
            name: info.name,
            birthday: info.birthday,
            phoneNumber: info.phone,
            address: info.address,
        }
    }


    getRealInfo(info, ui) {
        info.realInfo = {
            uid: ui.uid,
            name: ui.name,
            birthday: ui.birth,
            phoneNumber: ui.mobile,
            address: ui.address,
        }
    }

    //获取玩家的收货地址
    async getMailAddress(res, ui) {
        //当前只有一个收货地址，以后如果改为多个，记得改逻辑并返回默认收货地址
        let addr = await this.ctx.model.TravelModel.Address.findOne({ uid: ui.uid });
        if (!addr) {
            res.code = apis.Code.NONE_ADDRESS;
            return;
        }
        res.nickName = addr.name;
        res.tel = addr.tel;
        res.addr = addr.addr;
    }

    async showMyPostcards(info, ui) {
      let postcards = await this.ctx.model.TravelModel.Postcard.aggregate([
          { $match: { uid: ui.uid } },
          { $sort: { createDate: -1 } },
          { $group: { _id: "$province", collectPostcardNum: { $sum: 1 }, citys: { $push: { cid: "$cid" } }, pcards: { $push: { ptid: "$ptid", createDate: "$createDate" } } } },
          { $project: { _id: 0, province: "$_id", collectPostcardNum: 1, citys: 1, pcards: 1 } },
            ]);

      let postcardInfos = [];
      let provinceSet = new Set();
      for(let postcard of postcards) {
          provinceSet.add(postcard.province);
        //  let citys = postcard.citys;
        //  this.logger.info(citys);
          let postcardnum = 0;
          let postcardInfo = {
              url: travelConfig.Postcard.Get(postcard.pcards[0].ptid).picture,
              province: postcard.province,
              collectPostcardNum: postcard.collectPostcardNum,
          };
          let provinces = travelConfig.finds;
          for(let province of provinces) {
              if(province.province == postcard.province) {
                  for(let city of province.cityid) {
                      postcardnum += travelConfig.City.Get(city).postcardnum;
                  }
                  break;
              }

              this.logger.info(postcardnum)
          }
          postcardInfo.allPostcardNum = postcardnum;
          postcardInfos.push(postcardInfo);
      }

      let watchePost = [];
      let watchChats = await this.ctx.model.TravelModel.PostcardChatWatch.find({ uid: info.uid });
      for(let watchChat of watchChats) {
          let postcard = await this.ctx.model.TravelModel.Postcard.findOne({ pscid: watchChat.pscid });
          if(postcard) {
              if(!provinceSet.has(postcard.province)) {
                  provinceSet.add(postcard.province);
                  watchePost.push(postcard);
              }
          }
      }


      for(let postcard of watchePost) {
          let postcardInfo = {
              url: travelConfig.Postcard.Get(postcard.ptid).picture,
              province: postcard.province,
              collectPostcardNum: 0,
          };
          let provinces = travelConfig.finds;
          let postcardnum = 0;
          for(let province of provinces) {
              if(province.province == postcard.province) {
                  for(let city of province.cityid) {
                      postcardnum += travelConfig.City.Get(city).postcardnum;
                  }
                  break;
              }

              this.logger.info(postcardnum)
          }
          postcardInfo.allPostcardNum = postcardnum;
          postcardInfos.push(postcardInfo);
      }



        info.postcardInfo = postcardInfos;
    }
    async showCityPostcards(info, ui) {
        let postcardInfos = [];
        if(!Number(info.LM)) {
            let postcards = await this.ctx.model.TravelModel.Postcard.aggregate([
                { $match: { uid: ui.uid, province: info.province } },
                { $sort: { createDate: -1 } },
                {
                    $group: {
                        _id: "$cid",
                        collectPostcardNum: { $sum: 1 },
                        postcard: { $push: { pscid: "$pscid", ptid: "$ptid", createDate: "$createDate" } },
                    },
                },
                { $project: { _id: 0, cid: "$_id", collectPostcardNum: 1, postcard: 1 } },
            ]);
            for (let postcard of postcards) {
                let postcardInfo = {
                    city: travelConfig.City.Get(postcard.cid).city,
                   // collectPostcardNum: postcard.collectPostcardNum,
                    allPostcardNum: travelConfig.City.Get(postcard.cid).postcardnum,
                };

                let postcardBriefDetails = [];
               // let collectPostcardNum = 0;
                let collectPostcard = new Set();
                for (let pt of postcard.postcard) {
                    collectPostcard.add(pt.ptid);
                    let postcardBriefDetail = {
                        id: pt.pscid,
                        url: travelConfig.Postcard.Get(pt.ptid).picture,
                    };
                    if (postcardBriefDetail && postcardBriefDetail.id) {
                        postcardBriefDetails.push(postcardBriefDetail)
                    }

                }
               // this.logger.info(collectPostcard);
                postcardInfo.postcardsDetail = postcardBriefDetails;
                postcardInfo.collectPostcardNum = collectPostcard.size;

                postcardInfos.push(postcardInfo);
            }

        }else{
            //let chats = await this.ctx.model.TravelModel.PostcardChat.find({ sender: info.uid }).sort({ createDate: -1 });
            let postcardChats = await this.ctx.model.TravelModel.PostcardChat.aggregate([
                { $match: { sender: info.uid } },
                { $sort: { createDate: -1 } },
                { $group: { _id: "$pscid", firstMsg: { $first: { chatid: "$chatid", context: "$context", createDate: "$createDate", sender: "$sender" } } } },
                { $project: { _id: 0, pscid: "$_id", firstMsg: 1 } },
            ]);
          // this.logger.info(postcardChats);

            let watchChats = await this.ctx.model.TravelModel.PostcardChatWatch.find({ uid: info.uid });

            for(let watchChat of watchChats) {
                let postcard = await this.ctx.model.TravelModel.Postcard.findOne({ pscid: watchChat.pscid });
                if(postcard) {
                    let index = postcardChats.findIndex((n) => n.pscid == postcard.pscid);
                    this.logger.info(index);
                    if(index == -1) {
                        let firstMsg = await await this.ctx.model.TravelModel.PostcardChat.find({ pscid: postcard.pscid }).sort({ createDate: -1 });
                        if(firstMsg[0]) {
                            let postcardInfo = {
                                pscid: postcard.pscid,
                                firstMsg: firstMsg[0],
                            }
                            postcardChats.push(postcardInfo);
                        }

                    }
                }
            }

            let proPostcards = {};
            let citys = new Set();
            for(let postcardChat of postcardChats) {
                let pt = await this.ctx.model.TravelModel.Postcard.findOne({ pscid: postcardChat.pscid });
                if(pt.province == info.province) {
                    citys.add(pt.cid);

                    let postcardBriefDetail = {
                        id: pt.pscid,
                        url: travelConfig.Postcard.Get(pt.ptid).picture,
                    };
                    let firstChat = postcardChat.firstMsg;
                    let sender = await this.ctx.model.PublicModel.User.findOne({ uid: firstChat.sender });
                    postcardBriefDetail.lastestLiveMessage = {
                        id: firstChat.chatid,
                        time: (firstChat.createDate).format("yyyy-MM-dd"),
                        userInfo: {
                            uid: sender.uid,
                            nickName: sender.nickName,
                            avatarUrl: sender.avatarUrl,
                        },
                        message: firstChat.context,
                    };
                    if(proPostcards[pt.cid]) {
                        proPostcards[pt.cid].push(postcardBriefDetail);
                    }else{
                        proPostcards[pt.cid] = [ postcardBriefDetail ];
                    }

                    // this.logger.info("时间 ：", (firstChat.createDate).format("yyyy-MM-dd"));

                }
            }
            for(let city of citys) {
                let postcardInfo = {
                    cid: Number(city),
                    city: travelConfig.City.Get(city).city,
                    // collectPostcardNum: postcard.collectPostcardNum,
                };
                postcardInfo.postcardsDetail = proPostcards[city];
                postcardInfos.push(postcardInfo);
            }


            postcardInfos = utils.multisort(postcardInfos,
                (a, b) => (a.cid - b.cid)
                )
        }



        info.postcardInfo = postcardInfos;

    }

    async showDetailPostcard(info, ui) {
        let page = Number(info.page) ? Number(info.page) : 1;
        let limit = Number(info.messageLength) ? Number(info.messageLength) : travelConfig.Parameter.Get(travelConfig.Parameter.MAXMESSAGE).value;
        let chats = await this.ctx.model.TravelModel.PostcardChat.find({ pscid: info.id }).sort({ createDate: -1 }).skip((page - 1) * limit).limit(limit);
        let postcard = await this.ctx.model.TravelModel.Postcard.findOne({ pscid: info.id });
        await this.ctx.model.TravelModel.PostcardChatWatch.update({ uid: info.uid, pscid: info.id }, { uid: info.uid, pscid: info.id, watchDate: new Date() }, { upsert: true });
        info.mainUrl = travelConfig.Postcard.Get(postcard.ptid).picture;
        info.pattern = travelConfig.Postcard.Get(postcard.ptid).pattern;
        let detailLiveMessages = [];
        for(let i = 0; i < chats.length; i++) {
            let chat = chats[i];
            let sender = await this.ctx.model.PublicModel.User.findOne({ uid: chat.sender });
            let detailLiveMessage = {
                id: chat.chatid,
                time: (chat.createDate).format("yyyy-MM-dd hh:mm:ss"),
                userInfo: {
                    uid: sender.uid,
                    nickName: sender.nickName,
                    avatarUrl: sender.avatarUrl,
                },
                message: chat.context,
            };
            if(chats.length > 1) {
                if(i == 0) {
                    detailLiveMessage.hasNext = false;
                    detailLiveMessage.hasUp = true;
                }else if(i == chats.length - 1) {
                    detailLiveMessage.hasNext = true;
                    detailLiveMessage.hasUp = false;
                }else{
                    detailLiveMessage.hasNext = true;
                    detailLiveMessage.hasUp = true;
                }
            }else{
                detailLiveMessage.hasNext = false;
                detailLiveMessage.hasUp = false;
            }

            detailLiveMessages.push(detailLiveMessage);
        }
        info.lastestMessage = detailLiveMessages;
    }

    async sendPostcardMsg(info, ui, postcard) {
        let chatid = "chat" + ui.pid + new Date().getTime();
        await this.ctx.model.TravelModel.PostcardChat.create({
            uid: postcard.uid,       //拥有者
            pscid: postcard.pscid,   //明信片
            chatid: chatid,
            sender: ui.uid,          //回复者
            context: info.message,
            createDate: new Date(),
        });
        let chats = await this.ctx.model.TravelModel.PostcardChat.find({ pscid: postcard.pscid });
        let senders = new Set();
        for(let chat of chats) {
            senders.add(chat.sender);
        }
        if(!senders.has(postcard.uid)) {
            senders.add(postcard.uid)
        }
        let pcard = await this.ctx.model.TravelModel.Postcard.findOne({ pscid: postcard.pscid });
        //给所有人发送留言
        for(let senderid of senders) {
            let sender = await this.ctx.model.PublicModel.User.findOne({ uid: senderid });
            //let senderNickName = sender.nickName;
            let context = travelConfig.Message.Get(travelConfig.Message.POSTCARDMESSAGE).content;
            let content = context.replace("s%", ui.nickName).replace("a%", pcard.province).replace("b%", pcard.city);
            if(senderid != info.uid) {
                await this.ctx.model.TravelModel.UserMsg.create({
                    uid: senderid,
                    mid: "msg" + travelConfig.Message.POSTCARDMESSAGE + sender.pid + new Date().getTime(),
                    type: travelConfig.Message.POSTCARDMESSAGE,
                    title: travelConfig.Message.Get(travelConfig.Message.POSTCARDMESSAGE).topic,
                    content: content,
                    date: new Date(),
                })
            }

        }
    }

    async signInfo(info, ui) {
        info.hasSign = await this.ctx.model.PublicModel.SignInRecord.count({ uid: ui.uid, createDate: new Date().format("yyyy-MM-dd") });
        let cumulativeDays = (ui.cumulativeDays + 1);
        let day = cumulativeDays % 7;
        if (day == 0) {
            day = 7
        }
        info.theDay = day;
    }
    async toSign(info, ui) {
        let cumulativeDays = (ui.cumulativeDays + 1);
        let day = cumulativeDays % 7;
        if (day == 0) {
            day = 7
        }
        let cost = {
            cumulativeDays: 1,
        };
        let itemChange = {
            ["items." + travelConfig.Item.GOLD]: travelConfig.Login.Get(day).gold,
        };

        await this.ctx.model.PublicModel.SignInRecord.create({
            uid: ui.uid,
            appName: "travel",
            createDate: new Date().format("yyyy-MM-dd"),
            createDateTime: new Date(),
        });
        await this.ctx.model.PublicModel.User.update({ uid: ui.uid }, { $inc: cost });
        this.ctx.service.publicService.itemService.itemChange(ui.uid, itemChange, "travel");

    }


    async getRankInfo(info) {
        let page = Number(info.page) ? Number(info.page) : 1;
        let limit = Number(info.limit) ? Number(info.limit) : travelConfig.Parameter.Get(travelConfig.Parameter.COUNTLIMIT).value;
        let friendList = info.ui.friendList;
        friendList.push(info.ui.uid);
        let rankInfos = [];
        if(info.rankType == apis.RankType.SCORE) {
            info.selfRank = {
                achievement: info.ui.items[travelConfig.Item.POINT],
            };
            if(info.rankSubtype == apis.RankSubtype.COUNTRY) {
             //   this.logger.info("全国");
                rankInfos = await this.ctx.service.travelService.rankService.getScoreRankList(page, limit);
               // this.logger.info(rankInfos);
            }
            if(info.rankSubtype == apis.RankSubtype.FRIEND) {
                rankInfos = await this.ctx.service.travelService.rankService.getUserFriendScoreRankList(friendList, page, limit);
            }

        }
        if(info.rankType == apis.RankType.THUMBS) {
            let selfCompletionDegree = await this.ctx.service.travelService.rankService.getUserCompletionDegree(info.ui.uid);
            if(info.rankSubtype == apis.RankSubtype.COUNTRY) {
                info.selfRank = {
                    achievement: selfCompletionDegree ? selfCompletionDegree.completionDegree : 0,
                    weekAchievement: selfCompletionDegree ? selfCompletionDegree.weekCompletionDegree : 0,
                };
                rankInfos = await this.ctx.service.travelService.rankService.getCompletionDegreeRankList(page, limit);

            }
            if(info.rankSubtype == apis.RankSubtype.FRIEND) {
                info.selfRank = {
                    achievement: selfCompletionDegree ? selfCompletionDegree.completionDegree : 0,
                };
                rankInfos = await this.ctx.service.travelService.rankService.getUserFriendCompletionDegreeRankList(friendList, page, limit);
            }
        }

        if(info.rankType == apis.RankType.FOOT) {
            let selfFoot = await this.ctx.service.travelService.rankService.getUserFoot(info.ui.uid);
            if(info.rankSubtype == apis.RankSubtype.COUNTRY) {
                info.selfRank = {
                    achievement: selfFoot ? selfFoot.lightCityNum : 0,
                    weekAchievement: selfFoot ? selfFoot.weekLightCityNum : 0,
                };
                rankInfos = await this.ctx.service.travelService.rankService.getFootRankList(page, limit);
            }
            if(info.rankSubtype == apis.RankSubtype.FRIEND) {
                info.selfRank = {
                    achievement: selfFoot ? selfFoot.lightCityNum : 0,
                };
                rankInfos = await this.ctx.service.travelService.rankService.getUserFriendFootRankList(friendList, page, limit);
            }
        }

        //this.logger.info(rankInfos);

        let rankIndex = rankInfos.findIndex((n) => n.uid == info.ui.uid);
        this.logger.info("weizhi ========");
        this.logger.info(rankIndex);
        info.selfRank.rank = rankIndex + 1;
        let out = [];
        for(let index = 0; index < rankInfos.length; index++) {
          //  this.logger.info(rankInfos[index]);
            let rankItem = {
                rank: rankInfos[index].rank || (index + 1),
            };

            if(info.rankType == apis.RankType.SCORE) {
                rankItem.achievement = rankInfos[index].integral;
            }
            if(info.rankType == apis.RankType.FOOT) {
                rankItem.achievement = rankInfos[index].lightCityNum;
            }
            if(info.rankType == apis.RankType.THUMBS) {
                rankItem.achievement = rankInfos[index].completionDegree;
            }


            if(info.rankSubtype == apis.RankSubtype.COUNTRY) {
                if(info.rankType == apis.RankType.FOOT) {
                    rankItem.weekAchievement = rankInfos[index].weekLightCityNum;
                }
                if(info.rankType == apis.RankType.THUMBS) {
                    rankItem.weekAchievement = rankInfos[index].weekCompletionDegree;
                }
            }

          //   this.logger.info(rankInfos[index].integral);
            let user = rankInfos[index].uid == info.ui.uid ? info.ui : await this.ctx.model.PublicModel.User.findOne({ uid: rankInfos[index].uid });
          //  this.logger.info(rankInfos[index]);
          //    this.logger.info(user);
            rankItem.userInfo = {
                uid: user.uid,
                nickName: user.nickName,
                avatarUrl: user.avatarUrl,
            };

          //  this.logger.info(rankItem)
            out.push(rankItem);
        }
      // this.logger.info(out)
        info.ranks = out

    }

    async shareInfo(res) {
        //分享奖励
        let isFirst = await this.ctx.service.publicService.userService.dayShareReward(res.ui, travelConfig.Item.GOLD, travelConfig.Parameter.Get(travelConfig.Parameter.SHAREGOLD).value);
        res.isFirst = isFirst;
    }

}


module.exports = PlayerService;