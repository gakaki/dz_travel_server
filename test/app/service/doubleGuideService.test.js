'use strict';

const assert        = require('assert');
const { app }       = require('egg-mock/bootstrap');
const constant      = require('../../../app/utils/constant');
const travelConfig  = require("../../../sheets/travel")
const postcardRepo  = require('../../../app/service/configService/postcardRepo');
const questRepo     = require('../../../app/service/questService/questRepo');
const uuid          = require("uuid");

// 测试双人旅行
describe('test 测试双人旅行 流程 数据写入', () => {

    it('测试 写入user表 数据 ',  async () => {

        const ctx            = app.mockContext();

        let  uid             = "ov5W35XwjECAWGq0UK3omMfu9nak";
        let  friend          =

        //写入inviteCode表的数据
        let invitationCode = uuid.v1();
        let doubleFly = {
            code: invitationCode,
            inviter: .uid,
            invitee: "0",
            isFly: "0",
        };
                await this.app.redis.hmset(invitationCode, doubleFly);

        //先清空数据库user表


        //写入user表2个玩家


        //写入currentcity的2个玩家的


        //写入event表的2个玩家的





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