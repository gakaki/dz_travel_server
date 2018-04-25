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
describe('test 测试quest类', () => {

    it('生成 事件 含有知识点的  ',  async () => {

        let eid         =  '130010';  //上图是s%的哪个特产？
        let q           = questRepo.find(eid);
        // assert( q.answers[0].match(/s%/) == false )
    });

    it('测试 按照权重生成  ',  async () => {
        let makeEvent   = new MakeEvent();
        let events      = makeEvent.eventsFormat;
        assert(events.length > 0);
    });

    it('测试 有知识点的生成  ',  async () => {
        let row         = questRepo.quests.filter( e=>  e.picture == "" || e.picture == null );
        assert(row.length > 0);
    });

    it('检测缺少picture字段的  ',  async () => {
        let row         = questRepo.quests.filter( e=>  e.picture == "" || e.picture == null );
        assert(row.length > 0);
    });

    it('测试 reward 事件5',  async () => {
        let row         = questRepo.quests.filter( e=>  e.picture == "" || e.picture == null );
        assert(row.length > 0);
    });
});