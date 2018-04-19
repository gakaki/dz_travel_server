'use strict';

const assert        = require('assert');
const { app }       = require('egg-mock/bootstrap');
const constant      = require('../../../app/utils/constant');
const travelConfig  = require("../../../sheets/travel")
const apis          = require("../../../apis/travel");

describe('test tour services', () => {

    it('test userSpots',  async (done) => {
        const ctx       = app.mockContext();
        let info        = apis.TourIndexInfo.Init(ctx);
        info.cid        = 1;
        ctx.session     = {  'ui': { 'uid':'12321312' , 'pid': '123123123' } };
        let user_info   = ctx.session.ui;
        await ctx.service.travelService.tourService.userSpots(info,user_info);

        console.log( info ,user_info ,1 );
        hmset
    });


});