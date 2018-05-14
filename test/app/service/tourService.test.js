'use strict';

const assert        = require('assert');
const { app }       = require('egg-mock/bootstrap');
const constant      = require('../../../app/utils/constant');
const travelConfig  = require("../../../sheets/travel")
const apis          = require("../../../apis/travel");


describe('test tour services', () => {

    // let app;
    // before(() => {
    //     // 创建当前应用的 app 实例
    //     app = mock.app();
    //     // 等待 app 启动成功，才能执行测试用例
    //     return app.ready();
    // });



    it('test 弹出框中的事件page数字 05/10', async (done) => {
        const ctx = app.mockContext();

        let res = calcPageCount()
        console.log(res);

        assert(res == '0');


    });


    it('test 测试单人游玩中的playloop逻辑', async (done) => {
        const ctx = app.mockContext();
        let info = apis.PlayLoop.Init(ctx);
        info.uid = "ov5W35XwjECAWGq0UK3omMfu9nak";
        let res = await ctx.service.travelService.tourService.playloop(info);
        console.log(res);
        assert(res == '0');
    });


    it('test 测试单人游玩中的playloop逻辑', async (done) => {
        const ctx = app.mockContext();
        let info = apis.PlayLoop.Init(ctx);
        info.uid = "ov5W35XwjECAWGq0UK3omMfu9nak";
        let res = await ctx.service.travelService.tourService.playloop(info);
        console.log(res);
        assert(res == '0');
    });

    it('test 测试游玩中的eventshow 事件数量逻辑 eventshow',  async (done) => {
        const ctx       = app.mockContext();
        let info        = apis.PlayLoop.Init(ctx);
        info.uid        = "ov5W35XwjECAWGq0UK3omMfu9nak";
        let res         = await ctx.service.travelService.tourService.eventshow(info);
        console.log(res);
        assert( res == '0');



    });
});