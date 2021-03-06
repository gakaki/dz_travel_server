const Service = require('egg').Service;
const utils = require('../../utils/utils');
const constant = require('../../utils/constant');
const nonce = require('../../utils/nonce');
const moment = require("moment");
const xml2js = require('xml2js');
const parseString = require('xml2js').parseString;
const tenpay = require("tenpay");

module.exports = app => {
    return class WeChatService extends Service {
        async auth(param) {
            this.logger.info("我要进行微信授权登陆");
            let appid = (this.config.appid).trim();
            let appsec = (this.config.appsecret).trim();
            let authcode = JSON.parse(param.payload).code;
            let appName = param.appName;

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


        async minAppPay(ui, payCount, title, appName) {
            let result = {
                data: {}
            };
            // 规则，year/month/day 000000000
            let orderid = moment().format('YYYYMMDDhhmmssSS') + await this.ctx.model.WeChatModel.WechatUnifiedOrder.count();
            let payInfo = {
                price: Math.floor(payCount * 100),
                //  price:1,
                title: title,
                pid: ui.pid,
                type: "recharge",
                orderid: orderid,
                desc: "豆子网络-" + appName + "游戏",
                appName: appName
            };
            this.logger.info("我准备入库的金额 ：" + payInfo.price);


            let rcd = await this.ctx.model.WeChatModel.SdkUser.findOne({userid: ui.uid});
            if (!rcd) {
                result.status = constant.Code.TARGET_NOT_FOUND;
                return result;
            }


            await this.ctx.model.WeChatModel.RechargeRecord.create(payInfo);
            let wuo = {
                nonce_str: nonce.NonceAlDig(10),
                body: payInfo.desc,
                out_trade_no: payInfo.orderid,
                total_fee: payInfo.price,// 正式的价格
                time_start: moment(new Date()).format("YYYYMMDDHHMMSS"),
                spbill_create_ip: (this.ctx.request.socket.remoteAddress).replace("::ffff:", ""),
                notify_url: this.config.noticeurl,
                appid: this.config.appid,
                mch_id: this.config.pubmchid,
                openid: ui.uid,
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
            wtd.created = new Date().toLocaleDateString();
            wtd.createTime = new Date().toLocaleTimeString();
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


        async shopDone(appName) {
            this.ctx.req.setEncoding('utf8');
            let that = this;
            let result = {};
            let resultParam = {};
            let buf = "";
            this.ctx.req.on('data', (chunk) => {
                this.logger.info("接收数据");
                buf += chunk
            });
            this.ctx.req.on('end', async () => {
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
                            that.logger.log("没有查找到该微信订单 " + resultParam.out_trade_no);
                            result.code = false;
                            return result;
                        }

                        if (resultParam.cash_fee != rcd.price) {
                            that.logger.log("支付的金额和下单的金额不一致 " + resultParam.cash_fee + ":" + rcd.price);
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

                        if (appName == constant.AppName.GUESSNUM) {
                            that.service.guessnumService.guessnumService.doComplete(resultParam.out_trade_no, appName);
                        }


                        return result;
                    }

                })


            });

        }


        async ReqUserRefund(m) {
            const config = {
                appid: this.config.appid,
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

    }
};

