const Service = require('egg').Service;
const utils = require('./../utils/utils');
const constant = require('./../utils/constant');
const nonce = require('./../utils/nonce');
const configs=require('./../../config/configs');
const crypto = require("crypto");
const moment = require("moment");
const xml2js = require('xml2js');
const parseString = require('xml2js').parseString;
const fs=require("fs");
const tenpay=require("tenpay");
const  PID_INIT = 160000;
module.exports =app =>{
    return class UserService extends Service {
        async auth(param) {
            this.logger.info("我要进行微信授权登陆");
            let appid = (this.config.appid).trim();
            let appsec = (this.config.appsecret).trim();
            let authcode = JSON.parse(param.payload).code;

            let auResult= await this.doReqToken(appid,appsec,authcode);

            // let authtype = AuthType.MINI;
            this.logger.info("授权信息:"+JSON.stringify(auResult.data));
            if (auResult.data !=null) {
                //暂时用空信息，后面根据客户端汇报的信息再更新进来
                // 插入到数据库中
                let r= await this.ctx.model.SdkUser.update( {userid: auResult.data.openid},
                    {$set: {userid:auResult.data.openid}},
                    {upsert: true});
                this.logger.info("sdk用户入库更新:"+JSON.stringify(r));
                return auResult.data;
            }
            // 否则走重新授权的流程
            return null;

        }

        async login(param){
            let uid=param.uid;
            let sid=param._sid;
            this.logger.info("登陆时的参数 ："+uid+" "+sid );
            let result ={};
            //老用户登陆
            if(sid){
                let authUi=await this.collect(sid);
                this.logger.info("老用户登陆 ："+JSON.stringify(authUi));
                if(authUi == null){
                    let loginUser=await this.ctx.model.User.findOne({uid:uid});
                    this.logger.info("通过openid查库 ："+JSON.stringify(loginUser));
                    if(loginUser !=null){
                        let sid = this.GEN_SID();
                        this.recruitSid(sid,loginUser.pid);
                        this.logger.info("老用户刷新SID ："+sid);
                        result.sid=sid;
                        result.info=loginUser;
                        return result;
                    }

                }
                result.sid=sid;
                result.info=authUi;
                return result;
            }
            //第三方登陆
            let ui =null;
            if(uid){
                let sdkui = await this.ctx.model.SdkUser.findOne({userid:uid});
                this.logger.info("第三方登陆 ："+JSON.stringify(sdkui));
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
                    ui = await this.register(uid, JSON.parse(param.info).nickName, JSON.parse(param.info).avatarUrl, true);
                    let sid = this.GEN_SID();
                    this.logger.info("使用第三方凭据注册账号 " + ui.pid+ " sid : "+sid);
                    this.recruitSid(sid,ui.pid);
                }else{
                    //更新一次userInfo
                    await this.ctx.model.User.update({pid: ui.pid}, {$set: {nickName:  JSON.parse(param.info).nickName, avatarUrl:  JSON.parse(param.info).avatarUrl}});
                }
            }

            let ses = JSON.parse(await app.redis.get(ui.pid));

            if (ses) {
                let now = new Date().getTime();
                if (ses.expire < now){
                    ses.sid = this.GEN_SID(); // 过期重新生成
                    this.recruitSid(ses.sid,ui.pid);
                }
            }


            this.logger.info("{{=it.user}}@{{=it.sid}} 登陆成功", {user: ui.pid, sid: ses.sid});

            // 日志
            this.ctx.model.UserActionRecord.create({
                pid :ui.pid,
                type:constant.UserActionRecordType.LOGIN,
                data:{
                    agent:this.ctx.request.header['user-agent'],
                    host:this.ctx.request.header.host,
                    addr:(this.ctx.request.socket.remoteAddress).replace("::ffff:","")
                }
            });

            result.sid=ses.sid;
            result.info=ui;

             return result;
        }


        async minAppPay(ui,payCount,title){
            let result={
                data:{}
            };
            // 规则，year/month/day 000000000
            let orderid=moment().format('YYYYMMDDhhmmssSS')+await this.ctx.model.WechatUnifiedOrder.count();
            let payInfo={
                price:Math.floor(payCount*100),
              //  price:1,
                title:title,
                pid:ui.pid,
                type:"recharge",
                orderid:orderid,
                desc:"豆子网络-游戏",
            };
            this.logger.info("我准备入库的金额 ："+payInfo.price);



            let rcd = await this.ctx.model.SdkUser.findOne({userid:ui.uid});
            if (!rcd) {
                result.status = constant.Code.TARGET_NOT_FOUND;
                return result;
            }



            await this.ctx.model.RechargeRecord.create(payInfo);
            let wuo={
                nonce_str : nonce.NonceAlDig(10),
                body:payInfo.desc,
                out_trade_no : payInfo.orderid,
                total_fee : payInfo.price,// 正式的价格
                time_start:moment(new Date()).format("YYYYMMDDHHMMSS"),
                spbill_create_ip:(this.ctx.request.socket.remoteAddress).replace("::ffff:",""),
                notify_url:this.config.noticeurl,
                appid:this.config.appid,
                mch_id:this.config.pubmchid,
                openid :ui.uid,
                trade_type:"JSAPI"
            };
            let fields = utils.ToMap(wuo);
            wuo.sign = this.doSignaturePay(fields, this.config.pubkey);
            let builder = new xml2js.Builder();
            let xmlwxParam = builder.buildObject(wuo);
            this.logger.info("下单发送的数据 ："+xmlwxParam);
            try {
                let body=await this.ctx.curl("https://api.mch.weixin.qq.com/pay/unifiedorder",{
                    method:"POST",
                    data:xmlwxParam,
                    headers: {
                        'Content-Type': 'text/xml',
                        'charset': 'UTF-8'
                    },
                    dataType:"xml",
                });
                //console.log(body);
                let that =this;
                parseString(body.data, function (err, wxresult) {
                    if(err){
                        that.logger.error("请求失败："+err);
                        result.code=constant.Code.THIRD_FAILED;
                        wuo.success = false;
                    }
                     let realResult = wxresult["xml"];

                    let returnCode = realResult["return_code"][0];
                    that.logger.info("微信返回的数据 ："+returnCode);
                    if (returnCode === "SUCCESS") {
                        let prepay_id = realResult["prepay_id"][0];
                        let returnParam =
                            {
                                appId: that.config.appid,
                                nonceStr: nonce.NonceAlDig(10),
                                package: "prepay_id=" + prepay_id,
                                signType: "MD5",
                                timeStamp: parseInt(new Date().getTime() / 1000).toString()
                            };
                        let field = utils.ToMap(returnParam);
                        that.logger.info("准备返回给客户端的数据 ："+JSON.stringify(returnParam));
                        returnParam.paySign = that.doSignaturePay(field, that.config.pubkey);
                        returnParam.orderId=orderid;
                        result.data.payload=returnParam;
                        result.code=constant.Code.OK;
                        wuo.success=true;
                    }

                })

            }catch (err){
                this.logger.error("请求失败："+err);
                result.code=constant.Code.THIRD_FAILED;
                wuo.success = false;

            }

            this.ctx.model.WechatUnifiedOrder.create(wuo);

            return result;

        }

        async minAppWithdraw(ui,money){
            let wtd={};
            wtd.nonce_str = nonce.NonceAlDig(10);

            //sign
            wtd.partner_trade_no = "withdraw"+((new Date().getTime())/1000>>0);
            wtd.amount = Number(money); // 正式的价格
            wtd.spbill_create_ip = (this.ctx.request.socket.remoteAddress).replace("::ffff:","");
            wtd.mch_appid = this.config.appid;
            wtd.mchid = this.config.pubmchid;
            wtd.partnerKey = this.config.pubkey;
            wtd.check_name="NO_CHECK";
            wtd.desc="'奖励金提现'";
            wtd.openid = ui.uid;
            //wtd.openid = "oQq-J5XuO2NawkxByfpkMrOAPmLg";
            wtd.created = new Date().toLocaleDateString();
            wtd.createTime=new Date().toLocaleTimeString();
            let res = await this.ReqPaytoUser(wtd);
            if (!res) {
                wtd.success = false;
                this.ctx.model.WechatPaytoUser.create(wtd);
                return false;
            }else{
                wtd.success=true;
                this.ctx.model.WechatPaytoUser.create(wtd);
                return true
            }

        }



        async shopDone(){
            this.ctx.req.setEncoding('utf8');
            let that =this;
            let result={};
            let resultParam={};
            let buf="";
            this.ctx.req.on('data', (chunk) => {
                this.logger.info("接收数据");
                buf += chunk
            });
            this.ctx.req.on('end',async () => {
                await parseString(buf, async function (err, wxresult) {
                    let xml=wxresult.xml;
                    that.logger.info("支付微信回调结果 ："+JSON.stringify(xml));
                    let return_code=xml.return_code[0];
                    if (return_code != "SUCCESS") {
                        that.logger.info("支付失败！！");
                        resultParam.status = constant.Code.FAILED;
                        resultParam.return_code=return_code;
                        that.payCheck(resultParam);
                        result.code=false;
                        return result;
                    }else{
                      //  let signkey =that.config.pubkey;
                        resultParam={
                            "appid":xml.appid[0],
                            "bank_type": xml.bank_type[0],
                            "cash_fee":  xml.cash_fee[0],
                            "fee_type":  xml.fee_type[0],
                            "is_subscribe":  xml.is_subscribe[0],
                            "mch_id":  xml.mch_id[0],
                            "nonce_str":  xml.nonce_str[0],
                            "openid":  xml.openid[0],
                            "out_trade_no":  xml.out_trade_no[0],
                            "result_code":  xml.result_code[0],
                            "return_code":  xml.return_code[0],
                            "sign":  xml.sign[0],
                            "time_end":  xml.time_end[0],
                            "total_fee":  xml.total_fee[0],
                            "trade_type":  xml.trade_type[0],
                            "transaction_id":  xml.transaction_id[0],
                        };
                        that.logger.info("支付成功："+JSON.stringify(resultParam));
                        resultParam.status = constant.Code.OK;
                        that.payCheck(resultParam);
                        // 查询该订单的价格是否一致
                        let rcd = await that.ctx.model.RechargeRecord.findOne({orderid: resultParam.out_trade_no});
                        that.logger.info("查询到的微信订单 ："+JSON.stringify(rcd));

                        if (!rcd) {
                            that.logger.log("没有查找到该微信订单 " + resultParam.out_trade_no);
                            result.code=false;
                            return result;
                        }

                        if (resultParam.cash_fee != rcd.price) {
                            that.logger.log("支付的金额和下单的金额不一致 " + resultParam.cash_fee+":"+rcd.price);
                            result.code=false;
                            return result;
                        }
                        result.code=true;
                        result.orderid=resultParam.out_trade_no;

                        that.logger.info("准备更改订单状态 ："+resultParam.out_trade_no);
                        that.service.user.doComplete(resultParam.out_trade_no);

                        return result;
                    }

                })


            });

        }

        async doComplete(orderid){
            await this.ctx.model.RechargeRecord.update({
                orderid: orderid,
                close: {$ne: true}
            }, {$set: {close: true}});
            let rcd = await this.ctx.model.RechargeRecord.findOne({  orderid: orderid, close:true});
            this.logger.info("修改预下单状态 ："+JSON.stringify(rcd));
            if(rcd == null){
                return false;
            }
            let ui = await this.ctx.model.User.findOne({pid:rcd.pid});
            this.logger.info("准备生成红包");
            await this.ctx.service.guessnum.sendPack(ui,rcd.price,rcd.title,false,orderid);
            return true;
        }


        async collect(sid) {
            let ui = await this.findUserBySid(sid);
            if (ui) {
                // 续约
                this.recruitSid(sid, ui.pid);
                // 纪录访问
                await this.ctx.model.UserActionRecord.create({
                    pid :ui.pid,
                    type:constant.UserActionRecordType.LOGIN,
                    data:{
                        agent:this.ctx.request.header['user-agent'],
                        host:this.ctx.request.header.host,
                        addr:(this.ctx.request.socket.remoteAddress).replace("::ffff:","")
                    }
                });
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
                    [configs.configs().Item.MONEY]: 100,
                    [configs.configs().Item.ACCELERATION]: 100,
                    [configs.configs().Item.CASHCOUPON]: 100,
                }
            });


            // 日志
            this.ctx.model.UserActionRecord.create({ pid :pid,type:constant.UserActionRecordType.REGISTER});

            return ui;
        }

          recruitSid(sid, pid) {
            let session={
              pid : pid,
               sid : sid,
              expire : new Date().getTime() + this.config.session.maxAge
            };
            this.logger.info("存储session : "+JSON.stringify(session));
           app.redis.set(pid,JSON.stringify(session));
           app.redis.set(sid,JSON.stringify(session));
        }


         async findUserBySid(sid) {
            // 通过sid查找pid，再通过pid查找info
            let ses = JSON.parse(await app.redis.get(sid));
            if (ses == null){
                return null;
            }
            return await this.ctx.model.User.findOne({pid:ses.pid});
        }



         async doReqToken(appid,appsecret,authcode){
            this.logger.info("微信小程序：用户授权通过，获取 token,参数：appid:"+appid+" 密钥："+appsecret+" CODE:"+authcode);

            let m = {};
            m.authcode = authcode;
            m.appid = appid;
            m.appsecret = appsecret;


            try {
                let result= await this.ctx.curl("https://api.weixin.qq.com/sns/jscode2session?appid="+appid + "&secret="+appsecret + "&js_code="+authcode+ "&grant_type=authorization_code",{
                    method:"GET",
                    dataType:"json"
                });
               this.logger.info("微信返回的数据 :"+JSON.stringify(result));
                return result;

            }catch (err){
                this.logger.error(err);
                return null
            }
        }
         GEN_SID () {
            return crypto.createHash('md5').update(Math.random().toString()).digest('hex');
        };

         doSignaturePay(fields, key) {
            let argus = new Array();
            fields.forEach((v, k) => {
                argus.push(k + "=" + v);
            });
            argus.push("key=" + key);
            let plain = argus.join("&");

            let sign = utils.MD5(plain,constant.Format.HEX).toUpperCase();
            return sign;
        }

        async ReqPaytoUser(w){
            const config = {
                appid: w.mch_appid,
                mchid: w.mchid,
                partnerKey: w.partnerKey,
                pfx: this.config.file,
                spbill_create_ip:(this.ctx.request.socket.remoteAddress).replace("::ffff:","")
            };
            const api = new tenpay(config);

            let amount =Math.floor(w.amount*100*0.98);
            let money = amount/100;
            this.logger.info("准备提现 ："+amount+" 实际到账"+money);
            try{
                let result = await api.transfers({
                    partner_trade_no: w.partner_trade_no,
                    openid: w.openid,
                    amount: amount,
                    desc: w.desc,
                    check_name: w.check_name
                });
                this.logger.info("提现结果 ："+JSON.stringify(result));
                return true;
            }catch (err){
                this.logger.error("提现失败"+err);
                return false;
            }

        }

        async payCheck(WechatPayResults){
             await this.ctx.model.WechatPayResult.create(WechatPayResults);
             return true;
        }

    }
};

