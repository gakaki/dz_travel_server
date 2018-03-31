'use strict';

const assert    = require('assert');
const { app }   = require('egg-mock/bootstrap');

describe('test 事件系统', () => {

    it('测试event getEvent', async () => {
        // 创建 ctx
        const ctx   = app.mockContext();
        const row   = await ctx.service.publicService.eventService.getEvent('130050');
        assert(row.id == '130050');
    });

});