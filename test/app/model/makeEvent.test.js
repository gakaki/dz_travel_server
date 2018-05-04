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


    it('测试 按照权重生成  ',  async () => {
        let para        = {
            timeTotalHour  : 0,
            isNewPlayer    : 0,
            cid            : 0,
            weather        : 0,
            today          : 0,
            itemSpecial    : 0,
            spotId         : 0,
        }

        //权重优先 -1 那些 和 前置事件触发的后面必然在触发
        let makeEvent   = new MakeEvent();
        let events      = makeEvent.eventsFormat;
        assert(events.length > 0);
    });

    it('测试 有知识点的生成  ',  async () => {
        let row         = questRepo.quests.filter( e=>  e.picture == "" || e.picture == null );
        assert(row.length > 0);
    });
});

