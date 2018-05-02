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


    //需要补完
    it('测试事件任务的配置 测试事件的奖励配置', async () => {
        // 创建 ctx
        const ctx       = app.mockContext();
        const questCfg  = questRepo.find('110006'); //你一路上兴致勃勃地参观，当夕阳西下时，才恋恋不舍地离开。
        let rewards     = questCfg.getSpotRewardComment();
        console.log(rewards);

        let cid         = 3;
        let city        = travelConfig.City.Get(cid);
        rewards         = questCfg.getSpotRewardComment(city.city);
        console.log(rewards);

        rewards         = questCfg.getSpotRewardComment(city.city,"这是一个附加配置的讲");
        console.log(rewards);


    });



});