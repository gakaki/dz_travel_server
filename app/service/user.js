const Service = require('egg').Service;
const utils = require('./../utils/utils');
const configs=require('./../../config/configs');
const crypto = require("crypto");
const moment = require("moment");
const  PID_INIT = 160000;
module.exports =app =>{
    return class UserService extends Service {
        async auth(param) {
            this.logger.info("我要进行微信授权登陆");
            let appid = this.config.appid;
            let appsec = this.config.appsecret;
            let authcode = param.payload.code;
            let auResult= await this.doReqToken(appid,appsec,authcode);

            // let authtype = AuthType.MINI;
            if (auResult !=null) {
                //暂时用空信息，后面根据客户端汇报的信息再更新进来
                // 插入到数据库中
                await this.ctx.model.SdkUser.update( {userid: auResult.openid},
                    {$set: {deviceid: auResult.unionid,userid:auResult.openid}},
                    {upsert: true});

                return auResult;
            }
            // 否则走重新授权的流程
            return null;

        }

        async login(param){
            let uid=param.uid;
            let sid=param._sid;
            let result ={};
            //老用户登陆
            if(sid){
                let authUi=await this.collect(sid);
                result.sid=sid;
                result.info=authUi;
                return result;
            }
            //第三方登陆
            let ui =null;
            if(uid){
                let sdkui = await this.ctx.model.SdkUser.findOne({userid:uid});
                if (!sdkui) {
                    this.logger.error("尝试无效的第三方登陆");
                    result.info=null;
                    return result;
                }

                // 因为以后登陆仅仅通过sid，所以安全问题能得以提高
                 ui = await this.ctx.model.User.findOne({
                    uid: uid,
                    third: true
                });

                if (!ui) {
                    // 自动注册
                    ui = await this.register(uid, param.info.nickName, param.info.avatarUrl, true);
                    this.logger.info("使用第三方凭据注册账号 " + ui.pid);
                }else{
                    //更新一次userInfo
                    await this.ctx.model.User.update({pid: ui.pid}, {$set: {nickName: param.info.nickName, avatarUrl: param.info.avatarUrl}});
                }
            }
            let ses = await app.redis.get(ui.pid);
            if (ses) {
                let now = new Date().getTime();
                if (ses.expire < now){
                    ses.sid = this.GEN_SID(); // 过期重新生成
                }

            } else {
                // 首次登陆
                ses = {
                    sid:this.GEN_SID(),
                };
            }
            this.recruitSid(ses.sid,ui.pid);

            this.logger.log("{{=it.user}}@{{=it.sid}} 登陆成功", {user: ui.pid, sid: ses.sid});

            // 日志
            this.ctx.model.UserActionRecord.create({
                pid :ui.pid,
                type:utils.UserActionRecordType.LOGIN,
                data:{
                    agent:this.ctx.request.header['user-agent'],
                    host:this.ctx.request.header.host,
                    addr:this.ctx.request.socket.remoteAddress
                }
            });

            result.sid=ses.sid;
            result.info=ui;

             return result;
        }

        async minAppPay(ui,payCount,title){
            // 规则，year/month/day 000000000
            let orderid=moment().format('YYYYMMDDhhmmssSS')+this.ctx.model.WechatUnifiedOrder.count();
            let payInfo={
                price:Math.floor(payCount*100),
                title:title,
                pid:ui.pid,
                type:"recharge",
                orderid:orderid,
                desc:"豆子网络-游戏",
            };
            this.logger.info("我准备入库的金额 ："+payInfo.price);
            await this.ctx.model.RechargeRecord.create(payInfo);


        }


        async collect(sid) {
            let ui = await this.findUserBySid(sid);
            if (ui) {
                // 续约
                this.recruitSid(this.sid, ui.pid);
                // 纪录访问
              /*  this.ctx.model.UserAction.update({
                        pid: ui.pid,
                        router: this.action,
                        time: new Date()
                    },
                    {$inc: {count: 1}},
                    {upsert: true});*/
                return ui;
            }
            else {
                this.logger.error("提供了一个错误的sid {{=it.sid}}", {sid:sid});
                return null;
            }

        }

        // @third 是否是第三方登陆
        async register(uid, nickname, avatar, third){
            // 生成pid
            let count = await this.ctx.model.User.count();
            let pid=count+1;
            // 新建用户
            let ui = await this.ctx.model.User.create({
                uid: uid,
                nickName: nickname,
                avatarUrl: avatar,
                registertime: new Date().toLocaleString(),
                third: third,
                pid:(PID_INIT + pid).toString(),
                items:{
                    [configs.configs().Item.MONEY]: 0,
                    [configs.configs().Item.ACCELERATION]: 0,
                    [configs.configs().Item.CASHCOUPON]: 0,
                }
            });


            // 日志
            this.ctx.model.UserActionRecord.create({ pid :pid,type:utils.UserActionRecordType.REGISTER});

            return ui;
        }

         recruitSid(sid, pid) {
            let session={
              pid : pid,
               sid : sid,
              expire : new Date().getTime() + this.config.session.maxAge
            };
          app.redis.set(pid,session);
          app.redis.set(sid,session);
        }


         async findUserBySid(sid) {
            // 通过sid查找pid，再通过pid查找info
            let ses = await app.redis.get(sid);
            if (ses == null){
                return null;
            }
            return await this.ctx.model.User.findOne({sid:sid});
        }



         async doReqToken(appid,appsecret,authcode){
            this.logger.info("微信小程序：用户授权通过，获取 token");

            let m = new WxminiappToken();
            m.authcode = authcode;
            m.appid = appid;
            m.appsecret = appsecret;

            try {
                let result= await this.ctx.curl("https://api.weixin.qq.com/sns/jscode2session?appid="+appid + "secret="+appsecret + "js_code="+authcode+ "grant_type=authorization_code");
                console.log(result);
                return result;

            }catch (err){
                this.logger.error(err);
                return null
            }
        }
         GEN_SID () {
            return crypto.createHash('md5').update(Math.random().toString()).digest('hex');
        };


    }
};

