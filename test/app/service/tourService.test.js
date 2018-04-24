'use strict';

const assert        = require('assert');
const { app }       = require('egg-mock/bootstrap');
const constant      = require('../../../app/utils/constant');
const travelConfig  = require("../../../sheets/travel")
const apis          = require("../../../apis/travel");

let calcPageCount = (receivedTrueCount)  => {
    let total               = 10;
    let receivedTrueCount   = 10;
    let diff                = total - receivedTrueCount;
    let res                 = 0;
    if (diff <= 0 ){
        res                 = 10;
    }else{
        res                 = diff;
    }
    return res;
}

describe('test tour services', () => {

    it('test userSpots',  async (done) => {
        const ctx       = app.mockContext();
        let info        = apis.TourIndexInfo.Init(ctx);
        info.cid        = 1;
        ctx.session     = {  'ui': { 'uid':'12321312' , 'pid': '123123123' } };
        let user_info   = ctx.session.ui;
        await ctx.service.travelService.tourService.userSpots(info,user_info);

        console.log( info ,user_info ,1 );

    });

    it('test 测试eventshow 弹出框中的事件page数字 05/10',  async (done) => {
        const ctx       = app.mockContext();


        let res         = calcPageCount()
        console.log(res);

        assert( res == '0');


    });


    // (10 - received true count) >= 10 ? get one not received : 10 - received true count


});