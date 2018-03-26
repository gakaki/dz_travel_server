const Controller = require('egg').Controller;

//系统消息、组队通知、事件等
class TravelIOController extends Controller {

}

module.exports = TravelIOController;


// 定义websocket协议的数据结构时这样写：
// //定义一个客户端发送数据结构
// ws Aaabb extends WsSend {
//     require aa:string//客户端要填的字段aa
//     require bb:string//客户端要填的字段bb
//     optional cc:string//客户端选填的字段cc
// }
// //定义一个服务器发给客户端的数据结构
// ws Cdd extends WsReceive {
//     output dd:number//服务器返回字段dd
// }
//
// 转换成代码，预计是这样：
// class Aaabb extends WsSend {
//     constructor() {
//         this.action = 'aaabb'//这里取的是类名转成全小写，作为发送时的消息名
//
//         this._aa = null;
//         this._bb = null;
//         this._cc = null;
//     }
//
//     //以下是根据require optional声明，生成的getter setter:
//     //require type:string
//     get aa() {
//         return this._aa
//     }
//     set aa(v) {
//         this._aa = v;
//     }
//     //require type:string
//     get bb() {
//         return this._bb;
//     }
//     set bb(v) {
//         this._bb = v;
//     }
//     //optional type:string
//     get cc() {
//         return this._cc;
//     }
//     set cc(v) {
//         this._cc = v;
//     }
// }
//
// class Cdd extends WsReceive {
//     constructor(){
//         this.action = 'bccdd';//这里取的是类名转成全小写，作为的消息名
//         this._dd = null;
//     }
//     //output type:number
//     get dd() {
//         return this._dd;
//     }
//     set dd(v) {
//         this._dd = v;
//     }
// }
//
// //客户端使用时，预计为这样：
// //初始化websocket连接
// Base.WsInit();
//
// //发送到服务器一条消息
// let a = new Aaabb();
// a.aa = 'xxx',a.bb='xxxx';
// Base.WsSend(a);
//
// //监听服务器的消息
// Base.WsListen(Cdd, cdd => {
//     console.log('我接收到了服务器发来的Cdd定义的数据', cdd.dd)
// })
//
// //解除监听
// Base.WsUnlisten(Cdd);