'use strict';

const assert        = require('assert');
const { app }       = require('egg-mock/bootstrap');
const constant      = require('../../../app/utils/constant');
const travelConfig  = require("../../../sheets/travel")

describe('test model数据库类', () => {

    it('生成用户表的数据', async () => {
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
            pid: 21023,
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


});