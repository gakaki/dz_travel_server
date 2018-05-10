const  QuestAnser = require("./questAnswer");
const  questRepo  = require("./questRepo");

//测试 //130010 上图是s%的哪个特产
// let cid     = 104;
// let cfgId   = '130010';
// for ( let i = 0 ; i < 9 ;i++){
//     for ( let id of [cfgId] ){
//         let qa   = new QuestAnser( id , cid );
//         console.log(qa.toString());
//     }
// }

// 测试130020 上图是s%的哪个景点
// let cid     = 1;
// let cfgId   = '130020';
// for ( let i = 0 ; i < 9 ;i++){
//     for ( let id of [cfgId] ){
//         let cfg  = questRepo.find(id);
//         let qa   = new QuestAnser( cfg , cid );
//         console.log(qa.toString());
//     }
// }

//
// // 测试130030 上图是哪个景点
// let cid     = 3;
// let cfgId   = '130040';
// for ( let i = 0 ; i < 9 ;i++){
//     for ( let id of [cfgId] ){
//         let cfg  = questRepo.find(id);
//         let qa   = new QuestAnser( cfg , cid );
//         console.log(qa.toString());
//     }
// }


//测试130050 上图是哪个景点
// let cid     = 109;
// for ( let i = 0 ; i < 9 ;i++){
//     let qa   = new QuestAnser( 130050 , cid );
//     console.log(qa.toString());
// }


// 测试130060 上图是哪个景点
// let cid     = 1;
// let cfgId   = '130060';
// for ( let i = 0 ; i < 9 ;i++){
//     for ( let id of [cfgId] ){
//         let cfg  = questRepo.find(id);
//         let qa   = new QuestAnser( cfg , cid );
//         console.log(qa.toString());
//     }
// }



// 测试130061 一个二十多岁。。。。。
// let cid     = 3;
// let cfgId   = '130061';
// for ( let i = 0 ; i < 9 ;i++){
//     for ( let id of [cfgId] ){
//         let cfg  = questRepo.find(id);
//         let qa   = new QuestAnser( cfg , cid );
//         console.log(qa.toString());
//     }
// }
// 130070 130080 都提跳过了

// let cid     = 104; //厦门
// for ( let i = 0 ; i < 1 ;i++){
//     for ( let id = 130200 ; id <= 130209 ; id++ ){
//         let cfg  = questRepo.find(id);
//         let qa   = new QuestAnser( cfg , cid );
//         console.log(qa.toString());
//     }
// }


// let cid     = 104; //测试厦门奖励的问题
// for ( let i = 0 ; i < 1 ;i++){
//     for ( let eid = 200532 ; eid <= 200547 ; eid++ ){
//         let qa   = new QuestAnser( eid , cid );
//         console.log(qa.toString());
//     }
// }


 //
 // for ( let i = 0 ; i < 9 ;i++){
 //         let cid  = 78; //测试温州的失败奖励
 //         let eid  = '200027';
 //         let qa   = new QuestAnser( eid , cid );
 //         console.log(qa.toString());
 // }

// let cid  = 78; //测试温州的失败奖励
// let eid  = '200116';
// let qa   = new QuestAnser( eid , cid );
// console.log(qa.toString());
//
// console.log(questRepo.find(130070));