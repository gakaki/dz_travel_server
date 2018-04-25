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

    it('生成 事件 去掉那些%s s%的数据  ',  async () => {

        let para                 = {
            cid                  : 1,
            rentItems            : [],
            startTime            : [],
            weather              : 0,
            today                : 0,
            itemSpecial          : 0
        };
        let e                    = new MakeEvent(para);
        console.log(e.eventsFormat);
    });

    it('makeEventTest fakeCalcCurrIndex  ',  async () => {

        for ( let i=-1; i < 13; i++ ){
            let dbReceivedCount = i;
            let dbNoReceivedCount = i + 1;
            let res             = MakeEvent.fakeCalcCurrIndex(dbReceivedCount,dbNoReceivedCount);
        }

    });


});

