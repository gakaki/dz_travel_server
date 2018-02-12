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
                openid :ui.userid,
                trade_type:"JSAPI"
            };
            console.log(wuo);
            let fields = utils.ToMap(wuo);
            wuo.sign = this.doSignaturePay(fields, this.config.pubkey);
            let builder = new xml2js.Builder();
            let xmlwxParam = builder.buildObject(wuo);
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
                        this.logger.error("请求失败："+err);
                        result.code=constant.Code.THIRD_FAILED;
                        wuo.success = false;
                    }
                     let realResult = wxresult["xml"];
                    let returnCode = realResult["return_code"][0];
                    if (returnCode === "SUCCESS") {
                        let prepay_id = realResult["prepay_id"][0];
                        let returnParam =
                            {
                                appid: that.config.appid,
                                noncestr: nonce.NonceAlDig(10),
                                package: "prepay_id=" + prepay_id,
                                timestamp: parseInt(new Date().getTime() / 1000).toString(),
                                signType: "MD5",
                            };
                        let field = utils.ToMap(returnParam);
                        returnParam.sign = that.doSignaturePay(field, that.config.pubkey);
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
            wtd.partner_trade_no = "withdraw"+new Date().getTime()/1000>>0;
            wtd.amount = money; // 正式的价格
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
            let that =this;
            let result={};
            let resultParam={};
            this.ctx.request.on("data", function (chunk) {
                parseString(chunk, async function (err, wxresult) {
                    let xml=wxresult.xml;
                    console.log(xml);
                    let return_code=xml.return_code;
                    console.log(return_code);
                    if (return_code != "SUCCESS") {
                        resultParam.status = constant.Code.FAILED;
                        resultParam.return_code=return_code;
                        that.ctx.model.WechatPayResults.create(resultParam);
                        result.code=false;
                        return result;
                    }else{
                        let signkey =that.config.pubkey;
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
                        let fields = utils.ToMap(resultParam);
                        let sign = this.doSignaturePay(fields, signkey);
                        console.log("验证签名");
                        console.log(sign);
                        console.log(resultParam.sign);
                        resultParam.status = constant.Code.OK;
                        that.ctx.model.WechatPayResults.create(resultParam);

                        // 查询该订单的价格是否一致
                        let rcd = await that.ctx.model.RechargeRecord.findOne({orderid: resultParam.out_trade_no});

                        if (!rcd) {
                            this.logger.log("没有查找到该微信订单 " + resultParam.out_trade_no);
                            result.code=false;
                            return result;
                        }

                        if (resultParam.cash_fee != rcd.price) {
                            this.logger.log("支付的金额和下单的金额不一致 " + resultParam.cash_fee+":"+rcd.price);
                            result.code=false;
                            return result;
                        }
                        result.code=true;
                        result.orderid=resultParam.out_trade_no;
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
            if(rcd == null){
                return;
            }
            let ui = await this.ctx.model.User.findOne({pid:rcd.pid});
            this.ctx.service.guessnum.sendPack(ui,rcd.price,rcd.title,false);
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
            this.ctx.model.UserActionRecord.create({ pid :pid,type:constant.UserActionRecordType.REGISTER});

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
                pfx: fs.readFileSync("./../../config/apiclient_cert.p12"),
                spbill_create_ip:(this.ctx.request.socket.remoteAddress).replace("::ffff:","")
            };
            const api = new tenpay(config);

            try{
                let result = await api.transfers({
                    partner_trade_no: w.partner_trade_no,
                    openid: w.openid,
                    amount: Math.floor(w.amount*100*0.98)/100,
                    desc: w.desc,
                    check_name: w.check_name
                });
                return true;
            }catch (err){
                this.logger.error("提现失败"+err);
                return false;
            }

        }

    }
};

