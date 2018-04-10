'use strict';

const assert        = require('assert');
const { app }       = require('egg-mock/bootstrap');
const constant      = require('../../../app/utils/constant');
const travelConfig  = require("../../../sheets/travel")
const postcardRepo  = require('../../../app/service/configService/postcardRepo');

describe('test 游戏配置类 service', () => {

    it('测试 明信片配置 随机抽',  async () => {
        const ctx   = app.mockContext();
        const r     = postcardRepo.randomCitySpecial( 1 )
        console.log( r );
        assert(r.uid == '1000001');
    });

});