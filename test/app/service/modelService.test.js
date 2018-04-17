'use strict';

const assert        = require('assert');
const { app }       = require('egg-mock/bootstrap');
const constant      = require('../../../app/utils/constant');
const travelConfig  = require("../../../sheets/travel")

describe('test model数据库类', () => {

    it('生成用户表的数据',  async () => {
        const ctx   = app.mockContext();
        const sid   = 'ov5W35XwjECAWGq0UK3omMfu9nak';

        const row   = await ctx.model.PublicModel.User.create({
            uid: sid,
            appName: 'travel',
            nickName: 'gakaki',
            avatarUrl: '',
            gender: 23,
            city: '',
            province: '',
            country: '',
            registertime: Date.now() / 1000,
            pid: sid,
            items: {
                '1' : 86800,
                '2' : 0
            },
            cumulativeDays: 4,
            mileage: 0,
            isFirst: false,
            friendList: [],
            third: true,
            _v: 0,
            isSingleFirst: false
        });


        await app.redis.set(sid,JSON.stringify({'uid' : row.uid , 'pid': row.uid}))

        console.log(await app.redis.get(sid));

        let r = await ctx.service.publicService.userService.findUserBySid(sid);
        console.log( r );

        assert(r.uid == '1000001');
    });

    it('生成currentcity表',  async () => {
        const ctx   = app.mockContext();
        const uid   = 'ov5W35XwjECAWGq0UK3omMfu9nak';
        const row   = await ctx.model.TravelModel.CurrentCity.create({
            uid: uid,
            fid: '',
            cid: '1',
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
            friend:0,//默认单人旅行
            rentItems:{},
            photographyCount:0, //城市拍照次数 前2次免费
            photographySpots:[],    //拍照的景点id
            tourCount:0 ,//城市观光次数 前2次免费,
            rewardAppendTime: 2000, //被奖励？惩罚的 该城市游玩追加时间可以为负数
            events   : [
                {
                    "id" : 201584,
                    "received" : false,
                    "triggerDate" : 1523944201971.0,
                    "triggerDateYHM" : "2018-04-17 13:50:01"
                },
                {
                    "id" : 110111,
                    "received" : false,
                    "triggerDate" : 1523944501971.0,
                    "triggerDateYHM" : "2018-04-17 13:55:01"
                },
                {
                    "id" : (201560),
                    "received" : false,
                    "triggerDate" : 1523945401971.0,
                    "triggerDateYHM" : "2018-04-17 14:10:01"
                },
                {
                    "id" : (200249),
                    "received" : false,
                    "triggerDate" : 1523946121971.0,
                    "triggerDateYHM" : "2018-04-17 14:22:01"
                },
                {
                    "id" : (200927),
                    "received" : false,
                    "triggerDate" : 1523946901971.0,
                    "triggerDateYHM" : "2018-04-17 14:35:01"
                },
                {
                    "id" : (201191),
                    "received" : false,
                    "triggerDate" : 1523947261971.0,
                    "triggerDateYHM" : "2018-04-17 14:41:01"
                },
                {
                    "id" : (200437),
                    "received" : false,
                    "triggerDate" : 1523948161971.0,
                    "triggerDateYHM" : "2018-04-17 14:56:01"
                },
                {
                    "id" : (200504),
                    "received" : false,
                    "triggerDate" : 1523948941971.0,
                    "triggerDateYHM" : "2018-04-17 15:09:01"
                },
                {
                    "id" : (201269),
                    "received" : false,
                    "triggerDate" : 1523949301971.0,
                    "triggerDateYHM" : "2018-04-17 15:15:01"
                },
                {
                    "id" : (130222),
                    "received" : false,
                    "triggerDate" : 1523950081971.0,
                    "triggerDateYHM" : "2018-04-17 15:28:01"
                },
                {
                    "id" : (201264),
                    "received" : false,
                    "triggerDate" : 1523950981971.0,
                    "triggerDateYHM" : "2018-04-17 15:43:01"
                },
                {
                    "id" : (201338),
                    "received" : false,
                    "triggerDate" : 1523951701971.0,
                    "triggerDateYHM" : "2018-04-17 15:55:01"
                },
                {
                    "id" : (200989),
                    "received" : false,
                    "triggerDate" : 1523952301971.0,
                    "triggerDateYHM" : "2018-04-17 16:05:01"
                },
                {
                    "id" : (200439),
                    "received" : false,
                    "triggerDate" : 1523952601971.0,
                    "triggerDateYHM" : "2018-04-17 16:10:01"
                },
                {
                    "id" : (200966),
                    "received" : false,
                    "triggerDate" : 1523953381971.0,
                    "triggerDateYHM" : "2018-04-17 16:23:01"
                },
                {
                    "id" : (201573),
                    "received" : false,
                    "triggerDate" : 1523954041971.0,
                    "triggerDateYHM" : "2018-04-17 16:34:01"
                },
                {
                    "id" : (201553),
                    "received" : false,
                    "triggerDate" : 1523954341971.0,
                    "triggerDateYHM" : "2018-04-17 16:39:01"
                },
                {
                    "id" : (200091),
                    "received" : false,
                    "triggerDate" : 1523954941971.0,
                    "triggerDateYHM" : "2018-04-17 16:49:01"
                },
                {
                    "id" : (201625),
                    "received" : false,
                    "triggerDate" : 1523955481971.0,
                    "triggerDateYHM" : "2018-04-17 16:58:01"
                },
                {
                    "id" : (201352),
                    "received" : false,
                    "triggerDate" : 1523956081971.0,
                    "triggerDateYHM" : "2018-04-17 17:08:01"
                },
                {
                    "id" : (130246),
                    "received" : false,
                    "triggerDate" : 1523956921971.0,
                    "triggerDateYHM" : "2018-04-17 17:22:01"
                },
                {
                    "id" : (200503),
                    "received" : false,
                    "triggerDate" : 1523957341971.0,
                    "triggerDateYHM" : "2018-04-17 17:29:01"
                },
                {
                    "id" : (200448),
                    "received" : false,
                    "triggerDate" : 1523957941971.0,
                    "triggerDateYHM" : "2018-04-17 17:39:01"
                },
                {
                    "id" : (200573),
                    "received" : false,
                    "triggerDate" : 1523958721971.0,
                    "triggerDateYHM" : "2018-04-17 17:52:01"
                },
                {
                    "id" : (200919),
                    "received" : false,
                    "triggerDate" : 1523959021971.0,
                    "triggerDateYHM" : "2018-04-17 17:57:01"
                },
                {
                    "id" : (201093),
                    "received" : false,
                    "triggerDate" : 1523959501971.0,
                    "triggerDateYHM" : "2018-04-17 18:05:01"
                },
                {
                    "id" : (200402),
                    "received" : false,
                    "triggerDate" : 1523959981971.0,
                    "triggerDateYHM" : "2018-04-17 18:13:01"
                },
                {
                    "id" : (201068),
                    "received" : false,
                    "triggerDate" : 1523960881971.0,
                    "triggerDateYHM" : "2018-04-17 18:28:01"
                },
                {
                    "id" : (200610),
                    "received" : false,
                    "triggerDate" : 1523961181971.0,
                    "triggerDateYHM" : "2018-04-17 18:33:01"
                },
                {
                    "id" : (201560),
                    "received" : false,
                    "triggerDate" : 1523962021971.0,
                    "triggerDateYHM" : "2018-04-17 18:47:01"
                },
                {
                    "id" : (201480),
                    "received" : false,
                    "triggerDate" : 1523962381971.0,
                    "triggerDateYHM" : "2018-04-17 18:53:01"
                },
                {
                    "id" : (200303),
                    "received" : false,
                    "triggerDate" : 1523963041971.0,
                    "triggerDateYHM" : "2018-04-17 19:04:01"
                },
                {
                    "id" : (200934),
                    "received" : false,
                    "triggerDate" : 1523963461971.0,
                    "triggerDateYHM" : "2018-04-17 19:11:01"
                },
                {
                    "id" : (200002),
                    "received" : false,
                    "triggerDate" : 1523964181971.0,
                    "triggerDateYHM" : "2018-04-17 19:23:01"
                },
                {
                    "id" : (200548),
                    "received" : false,
                    "triggerDate" : 1523964661971.0,
                    "triggerDateYHM" : "2018-04-17 19:31:01"
                },
                {
                    "id" : (200179),
                    "received" : false,
                    "triggerDate" : 1523965501971.0,
                    "triggerDateYHM" : "2018-04-17 19:45:01"
                },
                {
                    "id" : (110021),
                    "received" : false,
                    "triggerDate" : 1523965801971.0,
                    "triggerDateYHM" : "2018-04-17 19:50:01"
                },
                {
                    "id" : (200250),
                    "received" : false,
                    "triggerDate" : 1523966221971.0,
                    "triggerDateYHM" : "2018-04-17 19:57:01"
                },
                {
                    "id" : (200125),
                    "received" : false,
                    "triggerDate" : 1523967121971.0,
                    "triggerDateYHM" : "2018-04-17 20:12:01"
                },
                {
                    "id" : (200378),
                    "received" : false,
                    "triggerDate" : 1523967541971.0,
                    "triggerDateYHM" : "2018-04-17 20:19:01"
                },
                {
                    "id" : (201160),
                    "received" : false,
                    "triggerDate" : 1523967961971.0,
                    "triggerDateYHM" : "2018-04-17 20:26:01"
                },
                {
                    "id" : (200065),
                    "received" : false,
                    "triggerDate" : 1523968501971.0,
                    "triggerDateYHM" : "2018-04-17 20:35:01"
                },
                {
                    "id" : (200039),
                    "received" : false,
                    "triggerDate" : 1523969221971.0,
                    "triggerDateYHM" : "2018-04-17 20:47:01"
                },
                {
                    "id" : (201195),
                    "received" : false,
                    "triggerDate" : 1523969701971.0,
                    "triggerDateYHM" : "2018-04-17 20:55:01"
                },
                {
                    "id" : (201610),
                    "received" : false,
                    "triggerDate" : 1523970421971.0,
                    "triggerDateYHM" : "2018-04-17 21:07:01"
                },
                {
                    "id" : (200742),
                    "received" : false,
                    "triggerDate" : 1523971021971.0,
                    "triggerDateYHM" : "2018-04-17 21:17:01"
                },
                {
                    "id" : (200854),
                    "received" : false,
                    "triggerDate" : 1523971381971.0,
                    "triggerDateYHM" : "2018-04-17 21:23:01"
                },
                {
                    "id" : (201305),
                    "received" : false,
                    "triggerDate" : 1523972221971.0,
                    "triggerDateYHM" : "2018-04-17 21:37:01"
                },
                {
                    "id" : (200066),
                    "received" : false,
                    "triggerDate" : 1523972521971.0,
                    "triggerDateYHM" : "2018-04-17 21:42:01"
                },
                {
                    "id" : (200601),
                    "received" : false,
                    "triggerDate" : 1523973361971.0,
                    "triggerDateYHM" : "2018-04-17 21:56:01"
                },
                {
                    "id" : (200126),
                    "received" : false,
                    "triggerDate" : 1523973721971.0,
                    "triggerDateYHM" : "2018-04-17 22:02:01"
                },
                {
                    "id" : (200384),
                    "received" : false,
                    "triggerDate" : 1523974201971.0,
                    "triggerDateYHM" : "2018-04-17 22:10:01"
                },
                {
                    "id" : (110074),
                    "received" : false,
                    "triggerDate" : 1523974921971.0,
                    "triggerDateYHM" : "2018-04-17 22:22:01"
                },
                {
                    "id" : (201563),
                    "received" : false,
                    "triggerDate" : 1523975761971.0,
                    "triggerDateYHM" : "2018-04-17 22:36:01"
                },
                {
                    "id" : (200293),
                    "received" : false,
                    "triggerDate" : 1523976601971.0,
                    "triggerDateYHM" : "2018-04-17 22:50:01"
                },
                {
                    "id" : (130080),
                    "received" : false,
                    "triggerDate" : 1523977141971.0,
                    "triggerDateYHM" : "2018-04-17 22:59:01"
                },
                {
                    "id" : (201077),
                    "received" : false,
                    "triggerDate" : 1523977561971.0,
                    "triggerDateYHM" : "2018-04-17 23:06:01"
                },
                {
                    "id" : (200980),
                    "received" : false,
                    "triggerDate" : 1523978281971.0,
                    "triggerDateYHM" : "2018-04-17 23:18:01"
                },
                {
                    "id" : (200498),
                    "received" : false,
                    "triggerDate" : 1523979001971.0,
                    "triggerDateYHM" : "2018-04-17 23:30:01"
                },
                {
                    "id" : (200595),
                    "received" : false,
                    "triggerDate" : 1523979901971.0,
                    "triggerDateYHM" : "2018-04-17 23:45:01"
                },
                {
                    "id" : (200451),
                    "received" : false,
                    "triggerDate" : 1523980741971.0,
                    "triggerDateYHM" : "2018-04-17 23:59:01"
                },
                {
                    "id" : (200169),
                    "received" : false,
                    "triggerDate" : 1523981161971.0,
                    "triggerDateYHM" : "2018-04-18 00:06:01"
                },
                {
                    "id" : (201436),
                    "received" : false,
                    "triggerDate" : 1523981761971.0,
                    "triggerDateYHM" : "2018-04-18 00:16:01"
                },
                {
                    "id" : (110102),
                    "received" : false,
                    "triggerDate" : 1523982661971.0,
                    "triggerDateYHM" : "2018-04-18 00:31:01"
                },
                {
                    "id" : (201118),
                    "received" : false,
                    "triggerDate" : 1523983261971.0,
                    "triggerDateYHM" : "2018-04-18 00:41:01"
                },
                {
                    "id" : (110065),
                    "received" : false,
                    "triggerDate" : 1523984101971.0,
                    "triggerDateYHM" : "2018-04-18 00:55:01"
                },
                {
                    "id" : (201257),
                    "received" : false,
                    "triggerDate" : 1523984401971.0,
                    "triggerDateYHM" : "2018-04-18 01:00:01"
                },
                {
                    "id" : (201096),
                    "received" : false,
                    "triggerDate" : 1523985301971.0,
                    "triggerDateYHM" : "2018-04-18 01:15:01"
                },
                {
                    "id" : (200521),
                    "received" : false,
                    "triggerDate" : 1523985661971.0,
                    "triggerDateYHM" : "2018-04-18 01:21:01"
                },
                {
                    "id" : (200605),
                    "received" : false,
                    "triggerDate" : 1523986321971.0,
                    "triggerDateYHM" : "2018-04-18 01:32:01"
                },
                {
                    "id" : (200445),
                    "received" : false,
                    "triggerDate" : 1523986681971.0,
                    "triggerDateYHM" : "2018-04-18 01:38:01"
                },
                {
                    "id" : (201610),
                    "received" : false,
                    "triggerDate" : 1523987041971.0,
                    "triggerDateYHM" : "2018-04-18 01:44:01"
                },
                {
                    "id" : (200110),
                    "received" : false,
                    "triggerDate" : 1523987641971.0,
                    "triggerDateYHM" : "2018-04-18 01:54:01"
                },
                {
                    "id" : (201344),
                    "received" : false,
                    "triggerDate" : 1523988241971.0,
                    "triggerDateYHM" : "2018-04-18 02:04:01"
                },
                {
                    "id" : (200492),
                    "received" : false,
                    "triggerDate" : 1523988961971.0,
                    "triggerDateYHM" : "2018-04-18 02:16:01"
                },
                {
                    "id" : (200693),
                    "received" : false,
                    "triggerDate" : 1523989381971.0,
                    "triggerDateYHM" : "2018-04-18 02:23:01"
                },
                {
                    "id" : (201419),
                    "received" : false,
                    "triggerDate" : 1523990161971.0,
                    "triggerDateYHM" : "2018-04-18 02:36:01"
                },
                {
                    "id" : (201001),
                    "received" : false,
                    "triggerDate" : 1523990461971.0,
                    "triggerDateYHM" : "2018-04-18 02:41:01"
                },
                {
                    "id" : (200135),
                    "received" : false,
                    "triggerDate" : 1523991001971.0,
                    "triggerDateYHM" : "2018-04-18 02:50:01"
                },
                {
                    "id" : (200866),
                    "received" : false,
                    "triggerDate" : 1523991301971.0,
                    "triggerDateYHM" : "2018-04-18 02:55:01"
                },
                {
                    "id" : (200947),
                    "received" : false,
                    "triggerDate" : 1523991601971.0,
                    "triggerDateYHM" : "2018-04-18 03:00:01"
                },
                {
                    "id" : (201266),
                    "received" : false,
                    "triggerDate" : 1523992201971.0,
                    "triggerDateYHM" : "2018-04-18 03:10:01"
                },
                {
                    "id" : (201408),
                    "received" : false,
                    "triggerDate" : 1523992921971.0,
                    "triggerDateYHM" : "2018-04-18 03:22:01"
                },
                {
                    "id" : (200648),
                    "received" : false,
                    "triggerDate" : 1523993401971.0,
                    "triggerDateYHM" : "2018-04-18 03:30:01"
                },
                {
                    "id" : (200981),
                    "received" : false,
                    "triggerDate" : 1523993881971.0,
                    "triggerDateYHM" : "2018-04-18 03:38:01"
                },
                {
                    "id" : (201565),
                    "received" : false,
                    "triggerDate" : 1523994421971.0,
                    "triggerDateYHM" : "2018-04-18 03:47:01"
                },
                {
                    "id" : (200594),
                    "received" : false,
                    "triggerDate" : 1523994781971.0,
                    "triggerDateYHM" : "2018-04-18 03:53:01"
                },
                {
                    "id" : (200815),
                    "received" : false,
                    "triggerDate" : 1523995381971.0,
                    "triggerDateYHM" : "2018-04-18 04:03:01"
                },
                {
                    "id" : (200987),
                    "received" : false,
                    "triggerDate" : 1523996101971.0,
                    "triggerDateYHM" : "2018-04-18 04:15:01"
                }
            ],
            modifyEventDate : null,
        });

        console.log( row );
        assert(row.uid == uid);
    });



    it('生成SpotTravelEvent数据 特产',  async () => {
        const ctx   = app.mockContext();
        const sid   = '1000001';

        let row     = {
            uid: sid,
            eid: '200049', // 类型4 特产
            cid: '1',
            spotId: '1000001',
            isPhotography: true,
            isTour:true,
            trackedNo:0,//默认单人旅行
            createDate: new Date()
        };
        await ctx.model.TravelModel.SpotTravelEvent.create(row);
        assert(row.uid == sid);
    });

    it('生成SpotTravelEvent数据  随机事件非经典 明信片为奖励',  async () => {
        const ctx   = app.mockContext();
        const sid   = '1000001';

        let row     = {
            uid: sid,
            eid: '200404', // 类型3 明信片 -1
            cid: '1',
            spotId: '1000001',
            isPhotography: false,
            isTour:false
        };
        await ctx.model.TravelModel.SpotTravelEvent.create(row);
        assert(row.uid == sid);
    });


    it('生成SpotTravelEvent数据  随机事件 1和5 金币和积分',  async () => {
        const ctx   = app.mockContext();
        const sid   = '1000001';

        let row     = {
            uid: sid,
            eid: '130010', // 类型3 明信片 -1
            cid: '1',
            spotId: '1000001',
            isPhotography: false,
            isTour:false
        };
        await ctx.model.TravelModel.SpotTravelEvent.create(row);
        assert(row.uid == sid);
    });

    it('生成SpotTravelEvent数据  随机问答题事件 问答题测试 无所谓正确与否',  async () => {
        const ctx   = app.mockContext();
        const sid   = '1000001';

        let row     = {
            uid: sid,
            eid: '120031', // 事件类型为2
            cid: '1',
            spotId: '',
            isPhotography: false,
            isTour:false
        };
        await ctx.model.TravelModel.SpotTravelEvent.create(row);
        assert(row.uid == sid);
    });

    it('生成SpotTravelEvent数据  随机问答题事件 问答题测试 正确的才能拿奖励',  async () => {
        const ctx   = app.mockContext();
        const sid   = '1000001';

        let row     = {
            uid: sid,
            eid: '130217', // 事件类型为3  答题正确与否
            cid: '1',
            spotId: '',
            isPhotography: false,
            isTour:false
        };
        await ctx.model.TravelModel.SpotTravelEvent.create(row);
        assert(row.uid == sid);
    });

});