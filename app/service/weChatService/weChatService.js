const Service = require('egg').Service;
const utils = require('../../utils/utils');
const constant = require('../../utils/constant');
const nonce = require('../../utils/nonce');
const moment = require("moment");
const xml2js = require('xml2js');
const parseString = require('xml2js').parseString;
const tenpay = require("tenpay");
const travelConfig = require("../../../sheets/travel");

class WeChatService extends Service {
    async auth(sdkAuth) {

        let appName = sdkAuth.appName;

        let appid = this.config.appid;
        let appsec = this.config.appsecret;
        let authcode = JSON.parse(sdkAuth.payload).code;

        this.logger.info("我要进行微信授权登陆" +appid);
        let auResult = await this.doReqToken(appid, appsec, authcode);

        // let authtype = AuthType.MINI;
        this.logger.info("授权信息:" + JSON.stringify(auResult.data));
        if (auResult.data != null) {
            //暂时用空信息，后面根据客户端汇报的信息再更新进来
            // 插入到数据库中
            let r = await this.ctx.model.WeChatModel.SdkUser.update({userid: auResult.data.openid},
                {$set: {userid: auResult.data.openid, unionid: auResult.data.unionid, appName: appName}},
                {upsert: true});
            this.logger.info("sdk用户入库更新:" + JSON.stringify(r));
            return auResult.data;
        }
        // 否则走重新授权的流程
        return null;

    }


    async minAppPay(ui, payCount, good, appName) {
        let result = {
            data: {}
        };
        // 规则，year/month/day 000000000
        let orderid = moment().format('YYYYMMDDhhmmssSS') + await this.ctx.model.WeChatModel.WechatUnifiedOrder.count();
        let payInfo = {
            price: payCount,
            //  price:1,
            goods: good,
            pid: ui.pid,
            type: "recharge",
            orderid: orderid,
            desc: "豆子网络-" + appName + "游戏",
            appName: appName,
            time: new Date(),
        };
        this.logger.info("我准备入库的金额 ：" + payInfo.price);


        let rcd = await this.ctx.model.WeChatModel.SdkUser.findOne({userid: ui.uid});
        if (!rcd) {
            result.status = constant.Code.TARGET_NOT_FOUND;
            return result;
        }


        await this.ctx.model.WeChatModel.RechargeRecord.create(payInfo);
        let wuo = {
            appid: this.config.appid,
            body: payInfo.desc,
            mch_id: this.config.pubmchid,
            nonce_str: nonce.NonceAlDig(10),
            notify_url: this.config.noticeurl+"/"+appName,
            openid: ui.uid,
            out_trade_no: payInfo.orderid,
            spbill_create_ip: (this.ctx.request.socket.remoteAddress).replace("::ffff:", ""),
            total_fee: payInfo.price,// 正式的价格
            time_start: moment(new Date()).format("YYYYMMDDHHMMSS"),
            trade_type: "JSAPI"
        };
        let fields = utils.ToMap(wuo);
        wuo.sign = this.doSignaturePay(fields, this.config.pubkey);
        let builder = new xml2js.Builder();
        let xmlwxParam = builder.buildObject(wuo);
        this.logger.info("下单发送的数据 ：" + xmlwxParam);
        try {
            let body = await this.ctx.curl("https://api.mch.weixin.qq.com/pay/unifiedorder", {
                method: "POST",
                data: xmlwxParam,
                headers: {
                    'Content-Type': 'text/xml',
                    'charset': 'UTF-8'
                },
                dataType: "xml",
            });
            //console.log(body);
            let that = this;
            parseString(body.data, function (err, wxresult) {
                if (err) {
                    that.logger.error("请求失败：" + err);
                    result.code = constant.Code.THIRD_FAILED;
                    wuo.success = false;
                }
                let realResult = wxresult["xml"];
                that.logger.info(realResult);
                let returnCode = realResult["return_code"][0];
                that.logger.info("微信返回的数据 ：" + returnCode);
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
                    that.logger.info("准备返回给客户端的数据 ：" + JSON.stringify(returnParam));
                    returnParam.paySign = that.doSignaturePay(field, that.config.pubkey);
                    returnParam.orderId = orderid;
                    result.data.payload = returnParam;
                    result.code = constant.Code.OK;
                    wuo.success = true;
                }

            })

        } catch (err) {
            this.logger.error("请求失败：" + err);
            result.code = constant.Code.THIRD_FAILED;
            wuo.success = false;

        }
        wuo.appName = appName;
        this.ctx.model.WeChatModel.WechatUnifiedOrder.create(wuo);

        return result;

    }

    async minAppWithdraw(ui, money, appName) {
        let wtd = {};
        wtd.nonce_str = nonce.NonceAlDig(10);

        //sign
        wtd.partner_trade_no = "withdraw" + ((new Date().getTime()) / 1000 >> 0);
        wtd.amount = Number(money); // 正式的价格
        wtd.spbill_create_ip = (this.ctx.request.socket.remoteAddress).replace("::ffff:", "");
        wtd.mch_appid = this.config.appid;
        wtd.mchid = this.config.pubmchid;
        wtd.partnerKey = this.config.pubkey;
        wtd.check_name = "NO_CHECK";
        wtd.desc = appName + "奖励金提现";
        wtd.openid = ui.uid;
        //wtd.openid = "oQq-J5XuO2NawkxByfpkMrOAPmLg";
        wtd.created = new Date().format("yyyy-MM-dd");
        wtd.createTime = new Date().format("hh:mm:ss");
        let res = await this.ReqPaytoUser(wtd);
        wtd.appName = appName;
        if (!res) {
            wtd.success = false;
            this.ctx.model.WeChatModel.WechatPaytoUser.create(wtd);
            return false;
        } else {
            wtd.success = true;
            this.ctx.model.WeChatModel.WechatPaytoUser.create(wtd);
            return true
        }

    }


    async minAppReferrer(ui,appName,referrerInfo){
        let referrer = {
            appName: appName,
            uid: ui.uid,
            path: referrerInfo.path,
            query: referrerInfo.query,
            scene: referrerInfo.scene,
            shareTicket: referrerInfo.shareTicket,
            referrerInfo: referrerInfo.referrerInfo,
            createDate: new Date(),
        };

        this.ctx.model.WeChatModel.Referrer.create(referrer);
        return true;
    }


    async shopDone(appName) {
        this.ctx.req.setEncoding('utf8');
        let that = this;
        let result = {};
        let resultParam = {};
        let buf = "";
        this.ctx.req.on('data', async (chunk) => {
            this.logger.info("接收数据");
            buf += chunk;
            await parseString(buf, async function (err, wxresult) {
                let xml = wxresult.xml;
                that.logger.info("支付微信回调结果 ：" + JSON.stringify(xml));
                let return_code = xml.return_code[0];
                if (return_code != "SUCCESS") {
                    that.logger.info("支付失败！！");
                    resultParam.status = constant.Code.FAILED;
                    resultParam.return_code = return_code;
                    that.payCheck(resultParam);
                    result.code = false;
                    return result;
                } else {
                    //  let signkey =that.config.pubkey;
                    resultParam = {
                        "appid": xml.appid[0],
                        "bank_type": xml.bank_type[0],
                        "cash_fee": xml.cash_fee[0],
                        "fee_type": xml.fee_type[0],
                        "is_subscribe": xml.is_subscribe[0],
                        "mch_id": xml.mch_id[0],
                        "nonce_str": xml.nonce_str[0],
                        "openid": xml.openid[0],
                        "out_trade_no": xml.out_trade_no[0],
                        "result_code": xml.result_code[0],
                        "return_code": xml.return_code[0],
                        "sign": xml.sign[0],
                        "time_end": xml.time_end[0],
                        "total_fee": xml.total_fee[0],
                        "trade_type": xml.trade_type[0],
                        "transaction_id": xml.transaction_id[0],
                    };
                    that.logger.info("支付成功：" + JSON.stringify(resultParam));
                    resultParam.status = constant.Code.OK;
                    that.payCheck(resultParam);
                    // 查询该订单的价格是否一致
                    let rcd = await that.ctx.model.WeChatModel.RechargeRecord.findOne({orderid: resultParam.out_trade_no});
                    that.logger.info("查询到的微信订单 ：" + JSON.stringify(rcd));

                    if (!rcd) {
                        that.logger.info("没有查找到该微信订单 " + resultParam.out_trade_no);
                        result.code = false;
                        return result;
                    }

                    if(rcd.close){
                        that.logger.info("该订单已经关闭 " + resultParam.cash_fee + ":" + rcd.price);
                        result.code = false;
                        return result;
                    }

                    if (resultParam.cash_fee != rcd.price) {
                        that.logger.info("支付的金额和下单的金额不一致 " + resultParam.cash_fee + ":" + rcd.price);
                        result.code = false;
                        return result;
                    }
                    result.code = true;
                    result.orderid = resultParam.out_trade_no;

                    that.logger.info("准备更改订单状态 ：" + resultParam.out_trade_no);

                    await that.ctx.model.WeChatModel.RechargeRecord.update({
                        orderid: resultParam.out_trade_no,
                        close: {$ne: true}
                    }, {$set: {close: true}});



                    that.doComplete(resultParam.out_trade_no, appName);



                    return result;
                }

            });

        });

    }

    async doComplete(orderid, appName) {
        let rcd = await this.ctx.model.WeChatModel.RechargeRecord.findOne({
            orderid: orderid,
            close: true,
            appName: appName,
        });
        this.logger.info("修改预下单状态 ：" + JSON.stringify(rcd));
        if (rcd == null) {
            return false;
        }
        let ui = await this.ctx.model.PublicModel.User.findOne({pid: rcd.pid, appName: appName });
        //修改数据库;
        let good = travelConfig.Pay.Get(rcd.goods);
        this.logger.info("商品 :", good);
        let cost = {
            ["items." + travelConfig.Item.GOLD]: Number(good.gold),
        };
        await this.ctx.service.publicService.itemService.itemChange(ui.uid, cost, "recharge", appName);

        return true;
    }


    async ReqUserRefund(m) {
        const config = {
            appid: m.appid,
            mchid: this.config.pubmchid,
            partnerKey: this.config.pubkey,
            pfx: this.config.file,
            spbill_create_ip: (this.ctx.request.socket.remoteAddress).replace("::ffff:", "")
        };
        const api = new tenpay(config);
        try {
            let result = await api.refund({
                op_user_id: this.config.pubid,
                out_refund_no: m.out_refund_no,
                out_trade_no: m.orderId,
                total_fee: m.total_fee,
                refund_fee: m.refund_fee,
            });
            this.logger.info("退款结果 ：" + JSON.stringify(result));
            return result;
        } catch (err) {
            this.logger.error("退款失败:" + err);
            return null;
        }

    }


    async doReqToken(appid, appsecret, authcode) {
        this.logger.info("微信小程序：用户授权通过，获取 token,参数：appid:" + appid + " 密钥：" + appsecret + " CODE:" + authcode);

        let m = {};
        m.authcode = authcode;
        m.appid = appid;
        m.appsecret = appsecret;


        try {
            let result = await this.ctx.curl("https://api.weixin.qq.com/sns/jscode2session?appid=" + appid + "&secret=" + appsecret + "&js_code=" + authcode + "&grant_type=authorization_code", {
                method: "GET",
                dataType: "json"
            });
            this.logger.info("微信返回的数据 :" + JSON.stringify(result));
            return result;

        } catch (err) {
            this.logger.error(err);
            return null
        }
    }

    doSignaturePay(fields, key) {
        let argus = new Array();
        fields.forEach((v, k) => {
            argus.push(k + "=" + v);
        });
        argus.push("key=" + key);
        let plain = argus.join("&");

        let sign = utils.MD5(plain, constant.Format.HEX).toUpperCase();
        return sign;
    }

    async ReqPaytoUser(w) {
        const config = {
            appid: w.mch_appid,
            mchid: w.mchid,
            partnerKey: w.partnerKey,
            pfx: this.config.file,
            spbill_create_ip: (this.ctx.request.socket.remoteAddress).replace("::ffff:", "")
        };
        const api = new tenpay(config);

        let amount = Math.floor(w.amount * 100 * 0.98);
        let money = amount / 100;
        this.logger.info("准备提现 ：" + amount + " 实际到账" + money);
        try {
            let result = await api.transfers({
                partner_trade_no: w.partner_trade_no,
                openid: w.openid,
                amount: amount,
                desc: w.desc,
                check_name: w.check_name
            });
            this.logger.info("提现结果 ：" + JSON.stringify(result));
            return true;
        } catch (err) {
            this.logger.error("提现失败" + err);
            return false;
        }

    }

    async payCheck(WechatPayResults) {
        await this.ctx.model.WeChatModel.WechatPayResult.create(WechatPayResults);
        return true;
    }


    async freshAccess_token() {
        try {
            let result = await this.ctx.curl(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.config.appid}&secret=${this.config.appsecret}`, {
                method: "GET",
                dataType: "json",
            });
            let access_token = result.data.access_token;
            this.logger.info(access_token);
            await this.app.redis.set("wechatAccessToken", access_token);
            return access_token;
        }catch (e) {
            this.logger.error(e);
        }
    }

    async sendTemplateMessage(uid , endTime = 0) {
        let access_token = await this.app.redis.get("wechatAccessToken");
        if(!access_token) {
            access_token = this.freshAccess_token();
        }
        let formId = await this.getFormId(uid);
        if(formId) {
            try {
                let result = await this.ctx.curl(`https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${access_token}`, {
                    method: "POST",
                    dataType: "json",
                    data: {
                        touser: uid,
                        template_id: "qr69hjrAqvs5IMiZj7f6-tJ1Ochav0mMlRLIDNRciLU",
                        form_id: formId,
                        data: {
                            keyword1: {
                                value: "339208499",
                                color: "#173177",
                            },
                            keyword2: {
                                value: "2015年01月05日 12:30",
                                color: "#173177",
                            },
                        },
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'charset': 'UTF-8',
                    },

                });

                this.logger.info(result);

                if(result.data.errcode != constant.Code.OK) {
                    this.sendTemplateMessage(uid);
                }
            }catch (e) {
                this.logger.info(e);
            }
        }


    }
    async getFormId(uid) {
        let formIds = await this.ctx.model.WeChatModel.TemplateMessage.find({ uid: uid, canUseNumber: { $gt: 0 } });
        if(formIds.length) {
            let formId = formIds.shift();
            await this.ctx.model.WeChatModel.TemplateMessage.update({ uid: uid, canUseNumber: { $gt: 0 } }, { $inc: { canUseNumber: -1 } });
            return formId;
        }
        return null;
    }

}


module.exports = WeChatService;