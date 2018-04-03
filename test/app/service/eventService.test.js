'use strict';

const assert        = require('assert');
const { app }       = require('egg-mock/bootstrap');
const constant      = require('../../../app/utils/constant');
const travelConfig  = require("../../../sheets/travel")

describe('test 事件系统', () => {

    it('测试事件任务的第一个任务', async () => {
        // 创建 ctx
        const ctx   = app.mockContext();
        const row   = await ctx.service.questService.questService.getEvent('130050');
        assert(row.id == '130050');
    });


    it('当前环境是否是local', async () => {
        // 创建 ctx
        const ctx   = app.mockContext();
        console.log(app.config.redis)
        // console.log(app.config.env)
        assert( app.config.env == 'local');

    });

    it('测试产看配置表', async () => {
        // 创建 ctx
        const ctx           = app.mockContext();
        const c             = constant.AppItem['travel'];
        console.log(travelConfig);

        console.log(c);
        assert( c.lenth > 0 );
        assert( 1 == 1 );



    });

});