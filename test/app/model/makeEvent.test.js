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
describe('test 测试双人旅行 流程 数据写入', () => {

    it('生成 事件 含有知识点的  ',  async () => {

        let para                 = {
            cid                  : cid,
            rentItems            : currentCity.rentItems,
            startTime            : currentCity.startTime,
            weather              : 0,
            today                : 0,
            itemSpecial          : 0
        };
        let e                    = new MakeEvent(para);

        console.log(e.eventsFormat);
    });



});