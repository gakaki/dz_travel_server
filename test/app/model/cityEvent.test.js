'use strict';

const assert        = require('assert');
const { app }       = require('egg-mock/bootstrap');
const constant      = require('../../../app/utils/constant');
const travelConfig  = require("../../../sheets/travel")
const postcardRepo  = require('../../../app/service/configService/postcardRepo');
const questRepo     = require('../../../app/service/questService/questRepo');
const uuid          = require("uuid");
const MakeEvent     = require('../../../app/service/travelService/makeEvent');

// 测试双人旅行
describe('test cityEvents 的事件', () => {

    it('生成 测试用户 CityEvents 获取所有 events ',  async () => {

        const ctx            = app.mockContext();
        let uid              = "ov5W35XwjECAWGq0UK3omMfu9nak";
        let ce               = await ctx.model.TravelModel.CityEvents.findOne({ uid:uid });
        let rows             = await ce.allowTriggerEvents();
        console.log(rows);

    });

});

