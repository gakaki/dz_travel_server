'use strict';

const assert        = require('assert');
const { app }       = require('egg-mock/bootstrap');
const constant      = require('../../../app/utils/constant');
const travelConfig  = require("../../../sheets/travel")
const postcardRepo  = require('../../../app/service/configService/postcardRepo');
const questRepo     = require('../../../app/service/questService/questRepo');

describe('test 游戏配置类 service', () => {

    it('测试 事件配置表 ',  async () => {
        const ctx            = app.mockContext();
        let q_postcard       = questRepo.find("200033");
        console.log(q_postcard.reward);
        assert(q_postcard.id == "200033");
    });
    it('测试 明信片配置 随机抽',  async () => {
        const ctx   = app.mockContext();
        for (let i=0;i <= 10;i++){
            const r     = postcardRepo.randomCitySpecial( 1 )
            console.log( r.id );
            assert(r.id > 1);
        }
    });

});