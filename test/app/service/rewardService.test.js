'use strict';

const assert        = require('assert');
const { app }       = require('egg-mock/bootstrap');
const constant      = require('../../../app/utils/constant');
const travelConfig  = require("../../../sheets/travel")
const questRepo     = require("../../../app/service/questService/questRepo")

describe('test reward奖励系统',  () => {
    /*
   事件奖励
   1 金币
   2 积分
   3 时间
   4 特产       后面跟特产id
   5 明信片     后面跟明信片id id -1 表示该城市随机特产明信片
    * */
    it('测试事件任务的配置 1金币测试', async () => {
        const ctx   = app.mockContext();
        const row   = questRepo.find('130050');
        assert(row != null);
    });

    it('测试事件任务的配置 2积分测试', async () => {
        const ctx   = app.mockContext();
        const row   = questRepo.find('130050');
        assert(row != null);
    });

    //需要补完
    it('测试事件任务的配置 4 特产后面跟特产id', async () => {
        const ctx   = app.mockContext();
        const row   = questRepo.find('130050');
        assert(row != null);
    });


    //需要补完
    it('测试事件任务的配置 4 特产后面跟特产id', async () => {
        const ctx   = app.mockContext();
        const row   = questRepo.find('130050');
        assert(row != null);
    });
    
    //需要补完
    it('测试事件任务的配置 3时间追加会导致修改makeline之类的', async () => {
        // 创建 ctx
        const ctx   = app.mockContext();
        const row   = questRepo.find('130050');
        assert(row != null);
    });



});