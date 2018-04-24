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



});