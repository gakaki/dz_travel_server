'use strict';

const assert        = require('assert');
const { app }       = require('egg-mock/bootstrap');
const constant      = require('../../../app/utils/constant');
const travelConfig  = require("../../../sheets/travel")
const postcardRepo  = require('../../../app/service/configService/postcardRepo');
const questRepo     = require('../../../app/service/questService/questRepo');
const uuid          = require("uuid");
const MakeEvent     = require('../../../app/service/travelService/makeEvent');

// 测试双人旅行
describe('test 测试双人旅行 流程 数据写入', () => {

    it('测试 写入数据表 ',  async () => {

        const ctx            = app.mockContext();

        let  uid             = "ov5W35XwjECAWGq0UK3omMfu9nak";
        let  friend          = "absdadew234resfdsfsd";
        let  cid             = 3;
        //先清空数据库表
        await ctx.model.PublicModel.User.remove();
        await ctx.model.TravelModel.CityEvents.remove();
        await ctx.model.TravelModel.CurrentCity.remove();

        // 写入invite code
        let inviteCode   =  "1231234";
        let fakeDouble       = {
                code        : inviteCode,
                uid         : uid,
                inviter     : "ov5W35XwjECAWGq0UK3omMfu9nak",       //邀请者
                invitee     : "absdadew234resfdsfsd"                //被邀请者
                // ov5W35XwjECAWGq0UK3omMfu9nak (inviter) ====(invite邀请)====>invitee（被邀请者）
        };
        if ( fakeDouble ){
            await ctx.app.redis.hmset(inviteCode,fakeDouble);
        }

        //写入user表2个玩家
        await ctx.model.PublicModel.User.create({
            "_id" : "5ad1a13c0c49f8127be04db7",
            "uid" : "ov5W35XwjECAWGq0UK3omMfu9nak",
            "appName" : "travel",
            "nickName" : "贺贤明",
            "avatarUrl" : "https://wx.qlogo.cn/mmopen/vi_32/Q3auHgzwzM6pjAcqAwjE9nTsd2icXAHHNqXOpicVpuBm5eVYicRfhzRkTJoztlSbNFjRJTGyCy8ibEsX5hvK027nzw/0",
            "gender" : (1),
            "city" : "",
            "province" : "Shanghai",
            "country" : "China",
            "registertime" : ("2018-04-14T06:35:40.104+0000"),
            "pid" : "21057",
            "items" : {
                "1" : (9979125),
                "2" : (511)
            },
            "hasPlay" : true,
            "cumulativeDays" : (5),
            "mileage" : (355),
            "isDoubleFirst" : true,
            "isSingleFirst" : false,
            "isFirst" : false,
            "friendList" : [

            ],
            "third" : true,
            "__v" : (0),
            "isNewPlayer" : false
        });

        await ctx.model.PublicModel.User.create({
            "_id" : "4ad1a13c0c49f8127be04db7",
            "uid" : "absdadew234resfdsfsd",
            "appName" : "travel",
            "nickName" : "小陈",
            "avatarUrl" : "http://studio515.cn/A_UpLoad/image/2014070813350292.jpg",
            "gender" : (1),
            "city" : "",
            "province" : "Shanghai",
            "country" : "China",
            "registertime" : "2018-04-14T06:35:40.104+0000",
            "pid" : "21057",
            "items" : {
                "1" : 9992445,
                "2" : 4
            },
            "hasPlay" : true,
            "cumulativeDays" : (4),
            "mileage" : (0),
            "isDoubleFirst" : true,
            "isSingleFirst" : false,
            "isFirst" : false,
            "friendList" : [

            ],
            "third" : true,
            "__v" : (0),
            "isNewPlayer" : false
        });

        //写入currentcity的2个玩家的
        await ctx.model.TravelModel.CurrentCity.create({
            "_id" : "9ad9cac8084c68e578b5940c",
            "uid" : "ov5W35XwjECAWGq0UK3omMfu9nak",
            "__v" : (0),
            "cid" : "3",
            "fid" : "fly1524222664526",
            "friend" : "absdadew234resfdsfsd",
            "isInviter" : true,
            "modifyEventDate" : ("2018-04-20T11:11:14.916+0000"),
            "photographyCount" : (2),
            "rentItems" : {
                "1" : (0),
                "2" : (0),
                "3" : (0),
                "4" : (0),
                "5" : (0),
                "6" : (0)
            },
            "roadMap" : [
                {
                    "id" : (100301),
                    "cid" : (3),
                    "x" : (116),
                    "y" : (54),
                    "isStart" : false,
                    "tracked" : false,
                    "trackedNo" : (0),
                    "name" : "外滩",
                    "desc" : "位于上海市中心黄浦区的黄浦江畔,是最具上海城市象征意义的景点之一。有人说“外滩的故事就是上海的故事”,外滩的精华就在于52幢风格各异被称为“万国建筑博览”的外滩建筑群。",
                    "building" : [
                        "4a",
                        "4b"
                    ],
                    "index" : (-1)
                },
                {
                    "id" : (100302),
                    "cid" : "3",
                    "name" : "上海迪士尼",
                    "building" : [
                        "25a",
                        "25b"
                    ],
                    "x" : (340),
                    "y" : (591),
                    "mileage" : (21),
                    "countdown" : (0),
                    "tracked" : false,
                    "index" : (0),
                    "startime" : 1524222675875.0,
                    "endtime" : 1524222675875.0,
                    "lng" : "121.670502",
                    "lat" : "31.146232",
                    "arriveStamp" : 1524222675875.0,
                    "arriveStampYMDHMS" : "2018-04-20 19:11:15"
                },
                {
                    "id" : (100303),
                    "cid" : "3",
                    "name" : "城隍庙",
                    "building" : [
                        "12a",
                        "12b"
                    ],
                    "x" : (116),
                    "y" : (212),
                    "mileage" : (6),
                    "countdown" : (0),
                    "tracked" : false,
                    "index" : (2),
                    "startime" : "",
                    "endtime" : 1524222677875.0,
                    "lng" : "121.498999",
                    "lat" : "31.231584",
                    "arriveStamp" : 1524222677875.0,
                    "arriveStampYMDHMS" : "2018-04-20 19:11:17"
                },
                {
                    "id" : (100304),
                    "cid" : (3),
                    "x" : (177),
                    "y" : (-78),
                    "isStart" : false,
                    "tracked" : false,
                    "trackedNo" : (0),
                    "name" : "东方明珠",
                    "desc" : "上海的标志性文化景观之一，位于浦东新区陆家嘴，毗邻黄浦江，与外滩隔江相望。东方明珠广播电视塔高467.9米，是观赏上海夜景的绝佳好去处。最佳观景点在观光层，立于其上，可360度欣赏上海美景；",
                    "building" : [
                        "21a",
                        "21b"
                    ],
                    "index" : (-1)
                },
                {
                    "id" : (100305),
                    "cid" : (3),
                    "x" : (-22),
                    "y" : (363),
                    "isStart" : false,
                    "tracked" : false,
                    "trackedNo" : (0),
                    "name" : "田子坊",
                    "desc" : "田子坊是由上海最有特色的石库门里弄演变而来，位于上海的浦西，在上海堪称很小资的地点之一。名字是画家黄永玉几年前起的雅号，个性、文艺的年轻人初到上海定会奔此地，来感受田子坊与众不同的个性。",
                    "building" : [
                        "16a",
                        "16b"
                    ],
                    "index" : (-1)
                },
                {
                    "id" : (100306),
                    "cid" : (3),
                    "x" : (28),
                    "y" : (-60),
                    "isStart" : false,
                    "tracked" : false,
                    "trackedNo" : (0),
                    "name" : "南京路步行街",
                    "desc" : "全国十大著名步行街之一，位于上海市黄浦区，西起西藏中路，东至河南中路，约1200米长。南京路已有100多年的历史，它的前身是“派克弄”，1865年正式命名为南京路。",
                    "building" : [
                        "16a",
                        "16b"
                    ],
                    "index" : (-1)
                },
                {
                    "id" : (100307),
                    "cid" : (3),
                    "x" : (-48),
                    "y" : (166),
                    "isStart" : false,
                    "tracked" : false,
                    "trackedNo" : (0),
                    "name" : "上海博物馆",
                    "desc" : "上海博物馆是一座大型的中国古代艺术博物馆，开设12个专题陈列室，包括青铜器、陶瓷器、书法、绘画、玉牙器、竹木漆器、甲骨、玺印、少数民族工艺等21个门类，其中尤以青铜器、陶瓷器、书法、绘画为特色。",
                    "building" : [
                        "10a",
                        "10b"
                    ],
                    "index" : (-1)
                },
                {
                    "id" : (100308),
                    "cid" : "3",
                    "name" : "中华艺术宫",
                    "building" : [
                        "10a",
                        "10b"
                    ],
                    "x" : (86),
                    "y" : (498),
                    "mileage" : (40),
                    "countdown" : (0),
                    "tracked" : false,
                    "index" : (1),
                    "startime" : 1524222676875.0,
                    "endtime" : 1524222676875.0,
                    "lng" : "121.501315",
                    "lat" : "31.190005",
                    "arriveStamp" : 1524222676875.0,
                    "arriveStampYMDHMS" : "2018-04-20 19:11:16"
                },
                {
                    "id" : (100309),
                    "cid" : (3),
                    "x" : (-61),
                    "y" : (31),
                    "isStart" : false,
                    "tracked" : false,
                    "trackedNo" : (0),
                    "name" : "杜莎夫人蜡像馆",
                    "desc" : "2006年，上海杜莎夫人蜡像馆在市中心南京西路新世界商厦10楼落成，上海从全球三十几个候选城市中脱颖而出，成为全球第六座杜莎夫人蜡像馆的落脚地。",
                    "building" : [
                        "10a",
                        "10b"
                    ],
                    "index" : (-1)
                },
                {
                    "id" : (100310),
                    "cid" : (3),
                    "x" : (243),
                    "y" : (57),
                    "isStart" : false,
                    "tracked" : false,
                    "trackedNo" : (0),
                    "name" : "上海环球金融中心",
                    "desc" : "上海环球金融中心是位于中国上海陆家嘴的一栋摩天大楼，2008年8月29日竣工。楼高492米，地上101层，是目前中国第3高楼（截至2014年）世界最高的平顶式大楼。",
                    "building" : [
                        "33a",
                        "33b"
                    ],
                    "index" : (-1)
                }
            ],
            "startTime" : ("2018-04-20T11:11:14.878+0000"),
            "tourCount" : (2),
            "acceleration" : (0)
        });

        await ctx.model.TravelModel.CurrentCity.create({
                "_id" : "5ad9cac8084c68e578b5940c",
                "uid" : "absdadew234resfdsfsd",
                "__v" : (0),
                "cid" : "3",
                "fid" : "fly1524222664526",
                "friend" : "ov5W35XwjECAWGq0UK3omMfu9nak",
                "isInviter" : false,
                "modifyEventDate" : ("2018-04-20T11:11:14.916+0000"),
                "photographyCount" : (2),
                "rentItems" : {
                    "1" : (0),
                    "2" : (0),
                    "3" : (0),
                    "4" : (0),
                    "5" : (0),
                    "6" : (0)
                },
                "roadMap" : [
                    {
                        "id" : (100301),
                        "cid" : (3),
                        "x" : (116),
                        "y" : (54),
                        "isStart" : false,
                        "tracked" : false,
                        "trackedNo" : (0),
                        "name" : "外滩",
                        "desc" : "位于上海市中心黄浦区的黄浦江畔,是最具上海城市象征意义的景点之一。有人说“外滩的故事就是上海的故事”,外滩的精华就在于52幢风格各异被称为“万国建筑博览”的外滩建筑群。",
                        "building" : [
                            "4a",
                            "4b"
                        ],
                        "index" : (-1)
                    },
                    {
                        "id" : (100302),
                        "cid" : "3",
                        "name" : "上海迪士尼",
                        "building" : [
                            "25a",
                            "25b"
                        ],
                        "x" : (340),
                        "y" : (591),
                        "mileage" : (21),
                        "countdown" : (0),
                        "tracked" : false,
                        "index" : (0),
                        "startime" : 1524222675875.0,
                        "endtime" : 1524222675875.0,
                        "lng" : "121.670502",
                        "lat" : "31.146232",
                        "arriveStamp" : 1524222675875.0,
                        "arriveStampYMDHMS" : "2018-04-20 19:11:15"
                    },
                    {
                        "id" : (100303),
                        "cid" : "3",
                        "name" : "城隍庙",
                        "building" : [
                            "12a",
                            "12b"
                        ],
                        "x" : (116),
                        "y" : (212),
                        "mileage" : (6),
                        "countdown" : (0),
                        "tracked" : false,
                        "index" : (2),
                        "startime" : "",
                        "endtime" : 1524222677875.0,
                        "lng" : "121.498999",
                        "lat" : "31.231584",
                        "arriveStamp" : 1524222677875.0,
                        "arriveStampYMDHMS" : "2018-04-20 19:11:17"
                    },
                    {
                        "id" : (100304),
                        "cid" : (3),
                        "x" : (177),
                        "y" : (-78),
                        "isStart" : false,
                        "tracked" : false,
                        "trackedNo" : (0),
                        "name" : "东方明珠",
                        "desc" : "上海的标志性文化景观之一，位于浦东新区陆家嘴，毗邻黄浦江，与外滩隔江相望。东方明珠广播电视塔高467.9米，是观赏上海夜景的绝佳好去处。最佳观景点在观光层，立于其上，可360度欣赏上海美景；",
                        "building" : [
                            "21a",
                            "21b"
                        ],
                        "index" : (-1)
                    },
                    {
                        "id" : (100305),
                        "cid" : (3),
                        "x" : (-22),
                        "y" : (363),
                        "isStart" : false,
                        "tracked" : false,
                        "trackedNo" : (0),
                        "name" : "田子坊",
                        "desc" : "田子坊是由上海最有特色的石库门里弄演变而来，位于上海的浦西，在上海堪称很小资的地点之一。名字是画家黄永玉几年前起的雅号，个性、文艺的年轻人初到上海定会奔此地，来感受田子坊与众不同的个性。",
                        "building" : [
                            "16a",
                            "16b"
                        ],
                        "index" : (-1)
                    },
                    {
                        "id" : (100306),
                        "cid" : (3),
                        "x" : (28),
                        "y" : (-60),
                        "isStart" : false,
                        "tracked" : false,
                        "trackedNo" : (0),
                        "name" : "南京路步行街",
                        "desc" : "全国十大著名步行街之一，位于上海市黄浦区，西起西藏中路，东至河南中路，约1200米长。南京路已有100多年的历史，它的前身是“派克弄”，1865年正式命名为南京路。",
                        "building" : [
                            "16a",
                            "16b"
                        ],
                        "index" : (-1)
                    },
                    {
                        "id" : (100307),
                        "cid" : (3),
                        "x" : (-48),
                        "y" : (166),
                        "isStart" : false,
                        "tracked" : false,
                        "trackedNo" : (0),
                        "name" : "上海博物馆",
                        "desc" : "上海博物馆是一座大型的中国古代艺术博物馆，开设12个专题陈列室，包括青铜器、陶瓷器、书法、绘画、玉牙器、竹木漆器、甲骨、玺印、少数民族工艺等21个门类，其中尤以青铜器、陶瓷器、书法、绘画为特色。",
                        "building" : [
                            "10a",
                            "10b"
                        ],
                        "index" : (-1)
                    },
                    {
                        "id" : (100308),
                        "cid" : "3",
                        "name" : "中华艺术宫",
                        "building" : [
                            "10a",
                            "10b"
                        ],
                        "x" : (86),
                        "y" : (498),
                        "mileage" : (40),
                        "countdown" : (0),
                        "tracked" : false,
                        "index" : (1),
                        "startime" : 1524222676875.0,
                        "endtime" : 1524222676875.0,
                        "lng" : "121.501315",
                        "lat" : "31.190005",
                        "arriveStamp" : 1524222676875.0,
                        "arriveStampYMDHMS" : "2018-04-20 19:11:16"
                    },
                    {
                        "id" : (100309),
                        "cid" : (3),
                        "x" : (-61),
                        "y" : (31),
                        "isStart" : false,
                        "tracked" : false,
                        "trackedNo" : (0),
                        "name" : "杜莎夫人蜡像馆",
                        "desc" : "2006年，上海杜莎夫人蜡像馆在市中心南京西路新世界商厦10楼落成，上海从全球三十几个候选城市中脱颖而出，成为全球第六座杜莎夫人蜡像馆的落脚地。",
                        "building" : [
                            "10a",
                            "10b"
                        ],
                        "index" : (-1)
                    },
                    {
                        "id" : (100310),
                        "cid" : (3),
                        "x" : (243),
                        "y" : (57),
                        "isStart" : false,
                        "tracked" : false,
                        "trackedNo" : (0),
                        "name" : "上海环球金融中心",
                        "desc" : "上海环球金融中心是位于中国上海陆家嘴的一栋摩天大楼，2008年8月29日竣工。楼高492米，地上101层，是目前中国第3高楼（截至2014年）世界最高的平顶式大楼。",
                        "building" : [
                            "33a",
                            "33b"
                        ],
                        "index" : (-1)
                    }
                ],
                "startTime" : ("2018-04-20T11:11:14.878+0000"),
                "tourCount" : (2),
                "acceleration" : (0)
            });


        //写入event表的2个玩家的
        let para                 = {
            cid                  : cid,
            rentItems            : [],
            startTime            : new Date(),
            timeTotalHour        : 24,
            weather              : 0,
            today                : 0,
            itemSpecial          : 0
        };


        let e   = new MakeEvent(para);
        await ctx.model.TravelModel.CityEvents.create({
            "uid" : uid,
            "events" : e.eventsFormat
        });
        await ctx.model.TravelModel.CityEvents.create({
            "uid" : friend,
            "events" : e.eventsFormat
        });

    });



});