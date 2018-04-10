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



    it('生成SpotTravelEvent表',  async () => {
        const ctx   = app.mockContext();
        const sid   = '1000001';

        let row     = {
            uid: sid,
            eid: '200049',
            cid: '1',
            spotId: '1000001',
            isPhotography: true,
            isTour:true,
            trackedNo:0,//默认单人旅行
            createDate: new Date()
        };
        await ctx.model.TravelModel.SpotTravelEvent.create(row);


        row['isTour'] = false;
        await ctx.model.TravelModel.SpotTravelEvent.create(row);
        assert(row.uid == sid);
    });
});