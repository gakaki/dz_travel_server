'use strict';

const assert        = require('assert');
const { app }       = require('egg-mock/bootstrap');
const constant      = require('../../../app/utils/constant');
const travelConfig  = require("../../../sheets/travel")
const postcardRepo  = require('../../../app/service/configService/postcardRepo');
const questRepo     = require('../../../app/service/questService/questRepo');
const cityRepo      = require('../../../app/service/questService/cityRepo');
const scenicspotRepo= require('../../../app/service/questService/scenicspotRepo');
const specialityRepo= require('../../../app/service/questService/specialityRepo');

const uuid          = require("uuid");
const MakeEvent     = require('../../../app/service/travelService/makeEvent');

// 测试双人旅行
describe('test 测试quest类', () => {

    it('生成 事件 含有知识点的  ',  async () => {

        let eid         =  '130010';  //上图是s%的哪个特产？
        let q           = questRepo.find(eid);
        // assert( q.answers[0].match(/s%/) == false )
    });

    it('检测缺少picture字段的  ',  async () => {
        let row         = questRepo.quests.filter( e=>  e.picture == "" || e.picture == null );
        assert(row.length > 0);
    });

    it('测试 必然触发的和有前置事件的 居然暂时不做了',  async () => {
        let row         = questRepo.quests.filter( e=>  e.probability == "-1" );
        assert(row.length <= 0);
    });

    it('测试 生成带s%的事件 知识点 = 1 130030 上图是哪个特产？',  async () => {
        let row         = questRepo.find("130010");
        row.dealKnowledgeRow(2); //天津
        assert((row && row.answers().indexOf("s%") == -1));
    });
    it('测试 生成带s%的事件 知识点 = 2 130040 上图是哪个景点？',  async () => {
        let row         = questRepo.find("130040");
        row.dealKnowledgeRow(2); //天津
        assert((row && row.answers().indexOf("s%") == -1));
    });
    it('测试 生成带s%的事件 知识点 = 3 130090 以下景点中，s%位于中国的哪个省？？',  async () => {
        let row         = questRepo.find("130090");
        row.dealKnowledgeRow(2);
        assert((row && row.answers().indexOf("s%") == -1));
    });

    it('测试 CityRepo ScenpoRepo 和 specialRepo的 random 4 函数',  async () => {

        let c = cityRepo.random4();
        assert(c.length == 4);
        c     = scenicspotRepo.random4()
        assert(c.length == 4);
        c     = specialityRepo.random4();
        assert(c.length == 4);

    });


    


//
//
// let n            = new QuestRepo();
//  let x = n.filterTourQuests({cid: 1,weather: 1, today: new Date(), itemSpecial: {},spotId:100101 })
// console.log(x.length);
// for(let xx of x) {
//     console.log(xx.id,xx.belong,xx.type);
// }
// let quest        = n.find("110034");
// let res          = quest.getSpotRewardComment();
// let question     = quest.describe;
// let answers      = quest.answers();
// console.log(quest.type,res,question,answers);
//
//     let n            = new QuestRepo();
//     let quest        = n.find("202335");
//     let res          = quest.getSpotRewardComment();
//     let question     = quest.describe;
//     let answers      = quest.answers();
//     let picture      = quest.picture;
//     console.log(quest.type,res,question,answers,picture);



// let n            = new QuestRepo();
// let quest        = n.find("110139");
// let res          = quest.getSpotRewardComment();
// let question     = quest.describe;
// let answers      = quest.answers();
// console.log(quest.type,res,question,answers);

// let n            = new QuestRepo();
// let quest        = n.find("110139");
// let res          = quest.getSpotRewardComment();
// let question     = quest.describe;
// let answers      = quest.answers();
// console.log(quest.type,res,question,answers);


    // 你好像有点迷路了，看来要耽误时间了，早知道找个导游了。	1		0	1	0	6.jpg				2:4,3:10	0	0	0	0	0	100	0							0

//
//
// let n            = new QuestRepo();
// let quest        = n.find("110136");
// let res          = quest.getSpotRewardComment();
// console.log(quest.type,res);

// let questConfigs = [130010,
// 130020,
// // 130030,
// // 130040,
// 130050,
// 130060,
// 130061,
// 130070,
// 130080,
// 130090,
// 130200,
// 130201,
// 130202,
// 130203,
// 130204,
// 130205,
// 130206,
// 130207,
// 130208,
// 130209];
//
// for (let q of questConfigs){
//    let quest        = n.find(q);
//    let cid          = 1;
//    let spotId       = 100101;
//    let res          = quest.describeFormat(cid ,spotId);
//
//    console.log(res);
//    res              = quest.describeFormat(1 );
//    console.log(res);
//
//     res              = quest.describeFormat(null,100101 );
//     console.log(res);
// }

//
// // type 1 金币
// let quest        = n.find("400037");
// let res          = quest.getSpotRewardComment();
// console.log(res);
//


// let n            = new QuestRepo();
// // type 1 金币
// let quest        = n.find("130204");
// let res          = quest.getSpotRewardComment();
// console.log(res);
// let n            = new QuestRepo();
// // type 1 金币
// let quest        = n.find("110033");
// let res          = quest.getSpotRewardComment();
// console.log(res);
//
//  res             = quest.getRewardNormal();
// console.log(res);
// //答题型抹去
// // type 1 金币CAMERA
//  quest        = n.find("130010");
//  res          = quest.getSpotRewardComment();
// console.log(res);
//
//
// // type 2 积分
//  quest     = n.find("110020");
//  res       = quest.getSpotRewardComment();
// console.log(res)
//
// // type 3 时间
//  quest     = n.find("200025");
//  res       = quest.getSpotRewardComment();
// console.log(res);
// // //type 4 特产
//  quest     = n.find("200030");
//  res       = quest.getSpotRewardComment();
// console.log(res);
// // type 5 明信片
//  quest     = n.find("200009");
//  res       = quest.getSpotRewardComment();
// console.log(res);
//
//
//
// // 混合型测试 200050
// quest     = n.find("200050");
// res       = quest.getSpotRewardComment();
// console.log(res);
//
// // 混合型测试 200068
// quest     = n.find("200068");
// res       = quest.getSpotRewardComment();
// console.log(res);
//
//
// quest        = n.find("200004");
// res          = quest.getRewardNormal();
// console.log(res);

});