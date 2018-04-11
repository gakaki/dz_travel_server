'use strict';

const assert        = require('assert');
const { app }       = require('egg-mock/bootstrap');
const constant      = require('../../../app/utils/constant');
const travelConfig  = require("../../../sheets/travel")

describe('test model数据库类', () => {

    it('生成用户表的数据',  async () => {
        const ctx   = app.mockContext();
        const sid   = '1000001';
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
        const sid   = '1000001';
        const row   = await ctx.model.TravelModel.CurrentCity.create({
            uid: sid,
            fid: '',
            cid: '1',
            sspid: '100101',
            progress: 0,
            roadMap:[],
            friend:0,//默认单人旅行
            rentItems:{},
            photographyCount:0, //城市拍照次数 前2次免费
            photographySpots:[],    //拍照的景点id
            tourCount:0 //城市观光次数 前2次免费
        });

        console.log( row );
        assert(row.uid == '1000001');
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