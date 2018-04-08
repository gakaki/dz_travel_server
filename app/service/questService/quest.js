// //一个简单的树结构
// class TreeNode {
//     constructor(  data ) {
//         this.parent     = null;
//         this.children   = [];
//         this.data       = data;
//     }
//
//     add( data ) {
//         let childNode       = TreeNode( data );
//         childNode.parent    = this;
//         this.children.add(childNode);
//         return childNode;
//     }
// }
//
// //事件（或者叫任务）类 有前后置关系 所以做成树状
// class Quest extends TreeNode {
//
//     constructor(data) {
//         super(data);
//
//         let d               = this.data;
//         this.id             = d.id;
//         this.describe       = d.describe;   //事件描述 '以下特产中，哪个是s%的特产？',
//         this.trigger_type   = d.subtype;    //事件触发类型
//                                             // 1、通用城市事件：在所有城市游玩都可以触发的事件；
//                                             // 2、特定城市事件：在特定城市游玩才能触发的事件；
//                                             // 3、通用观光事件：在所有城市观光都可以触发的事件；
//                                             // 4、特定观光事件：在特定城市观光才能触发的事件；
//         // this.loc_name       = d['loc_name']; //地点中文
//
//         this.belong         =  d.belong;     //事件归属
//         this.type           =  d.type;       //事件触发的景点或城市，通用事件填0
// // 1、普通事件
// // 2、剧情类答题事件（无需显示是否答对）
// // 3、知识类答题事件（需要显示是否答对）
//
//         this.topic          =  d.topic;
//         // 知识点
//         // 0:常规
//         // 1：特产
//         // 2：景点
//         // 3：地方归属
//
//
//         this.picture        =  d.picture;       //0表示没有图片
//         this.reward         =  d.reward;        //事件奖励
// // 1金币
// // 2时间
// // 3明信片：后面跟明信片id，明信片id填-1表示该城市随机特产明信片
// // 4特产：后面跟特产id，
// // 5积分
//
//         this.errorreward    =  d.errorreward;   //答题错误奖励0表示无奖励
//         this.condition1     =  d.condition1;    //前置事件
//         // 0表示无前置事件
//         // 前置事件如果是答题事件，需要答对才能继续往下进行。c
//         // 0表示无前置事件
//         // 前置事件如果是答题事件，需要答对才能继续往下进行。
//
//         this.condition2     =  d.condition2;    //特定日期
//         /*
//             格式
//             a/b/c
//             a：1表示阳历；2表示阴历
//             b:月份
//             c:日期
//             填0表示无日期限制
//             a1/b1/c1:a2/b2/c2表示时间段
//         */
//         this.condition3     =  d.condition3;    //特定天气      0：无天气限定1：晴天2：阴天3：雨天4：雪天
//         this.condition4     =  d.condition4;    //特定道具      0 无限制 1 不拥有医药箱
//         this.probability    =  d.probability;   //触发权重      -1表示必定触发
//         this.inform         =  d.inform;        //是否在界面推送
//         this.answer         =  d.answer;        //正确答案
//         this.wrong1         =  d.wrong1;        //错误答案1
//         this.wrong2         =  d.wrong2;        //错误答案2
//         this.wrong3         =  d.wrong3;        //错误答案3
//     }
// }
//
// module.exports =  Quest;
