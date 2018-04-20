'use strict';

const assert        = require('assert');
const { app }       = require('egg-mock/bootstrap');
const constant      = require('../../../app/utils/constant');
const travelConfig  = require("../../../sheets/travel")
const postcardRepo  = require('../../../app/service/configService/postcardRepo');
const questRepo     = require('../../../app/service/questService/questRepo');
const uuid          = require("uuid");

// 测试双人旅行
describe('test 测试双人旅行 流程 数据写入', () => {

    it('测试 写入数据表 ',  async () => {

        const ctx            = app.mockContext();

        let  uid             = "ov5W35XwjECAWGq0UK3omMfu9nak";
        let  friend          = "absdadew234resfdsfsd";

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
        const row   = await ctx.model.TravelModel.CurrentCity.create({
            uid: uid,
            fid: '',
            cid: '1',
            isInviter: true,
            sspid: '100101',
            progress: 0,
            roadMap:[
                {
                    "id": 100107,
                    "cid": "1",
                    "name": "八达岭长城",
                    "building": [
                        "22a",
                        "22b"
                    ],
                    "x": 196,
                    "y": 292,
                    "tracked": false,
                    "index": 0,
                    "startTime": "",
                    "startime": 1523961573499,
                    "endTime": 1523961573499,
                    "endtime": 1523961573499,
                    "lng": "116.016033",
                    "lat": "40.364233",
                    "arriveStamp": 1523961573499,
                    "arriveStampYMDHMS": "2018-04-17 18:39:33"
                },
                {
                    "id": 100102,
                    "cid": "1",
                    "name": "颐和园",
                    "building": [
                        "2a",
                        "2b"
                    ],
                    "x": 224,
                    "y": 714,
                    "tracked": false,
                    "index": 1,
                    "startTime": "",
                    "startime": 1523978853499,
                    "endTime": 1523978853499,
                    "endtime": 1523978853499,
                    "lng": "116.274853",
                    "lat": "39.998547",
                    "arriveStamp": 1523978853499,
                    "arriveStampYMDHMS": "2018-04-17 23:27:33"
                }
            ],
            friend:friend,//默认单人旅行
            rentItems:{},
            photographyCount:0, //城市拍照次数 前2次免费
            photographySpots:[],    //拍照的景点id
            tourCount:0 ,//城市观光次数 前2次免费,
            rewardAppendTime: 2000, //被奖励？惩罚的 该城市游玩追加时间可以为负数
            modifyEventDate : null,
        });

        await ctx.model.TravelModel.CurrentCity.create({
            uid: friend,
            fid: '',
            cid: '1',
            sspid: '100101',
            progress: 0,
            isInviter: false,
            roadMap:[
                {
                    "id": 100107,
                    "cid": "1",
                    "name": "八达岭长城",
                    "building": [
                        "22a",
                        "22b"
                    ],
                    "x": 196,
                    "y": 292,
                    "tracked": false,
                    "index": 0,
                    "startTime": "",
                    "startime": 1523961573499,
                    "endTime": 1523961573499,
                    "endtime": 1523961573499,
                    "lng": "116.016033",
                    "lat": "40.364233",
                    "arriveStamp": 1523961573499,
                    "arriveStampYMDHMS": "2018-04-17 18:39:33"
                },
                {
                    "id": 100102,
                    "cid": "1",
                    "name": "颐和园",
                    "building": [
                        "2a",
                        "2b"
                    ],
                    "x": 224,
                    "y": 714,
                    "tracked": false,
                    "index": 1,
                    "startTime": "",
                    "startime": 1523978853499,
                    "endTime": 1523978853499,
                    "endtime": 1523978853499,
                    "lng": "116.274853",
                    "lat": "39.998547",
                    "arriveStamp": 1523978853499,
                    "arriveStampYMDHMS": "2018-04-17 23:27:33"
                }
            ],
            friend: uid,          //默认单人旅行
            rentItems:{},
            photographyCount:0, //城市拍照次数 前2次免费
            photographySpots:[],    //拍照的景点id
            tourCount:0 ,//城市观光次数 前2次免费,
            rewardAppendTime: 2000, //被奖励？惩罚的 该城市游玩追加时间可以为负数
            modifyEventDate : null,
        });

        //写入event表的2个玩家的
        await ctx.model.TravelModel.CityEvents.create({
            "uid" : uid,
            "events" : [
            {
                "triggerDateYHM" : "2018-04-20 13:34:57",
                "triggerDate" : 1524202497785.0,
                "received" : false,
                "eid" : (110100),
                "id" : ("5ad978b9d7366a0bc69ec1f2")
            },
            {
                "triggerDateYHM" : "2018-04-20 13:49:57",
                "triggerDate" : 1524203397785.0,
                "received" : false,
                "eid" : (110064),
                "id" : ("5ad978b9d7366a0bc69ec1f3")
            }
            ]
        });
        await ctx.model.TravelModel.CityEvents.create({
            "uid" : friend,
            "events" : [
                {
                    "triggerDateYHM" : "2018-04-20 13:34:57",
                    "triggerDate" : 1524202497785.0,
                    "received" : false,
                    "eid" : (110100),
                    "id" : ("5ad978b9d7366a1bc69ec1f2")
                },
                {
                    "triggerDateYHM" : "2018-04-20 13:49:57",
                    "triggerDate" : 1524203397785.0,
                    "received" : false,
                    "eid" : (110064),
                    "id" : ("5ad978b9d7366a1bc69ec1f3")
                }
            ]
        });

    });

    it('测试 明信片配置 随机抽',  async () => {

        const ctx   = app.mockContext();
        for (let i=0;i <= 10;i++){
            const r     = postcardRepo.randomCitySpecial( 1 )
            console.log( r.id );
            assert(r.id > 1);
        }

    });

});