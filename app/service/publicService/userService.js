const Service = require('egg').Service;

const constant = require('../../utils/constant');
const crypto = require("crypto");
const travelConfig = require("../../../sheets/travel");
const WXBizDataCrypt = require("../weChatService/WXBizDataCrypt");

class UserService extends Service {

    async login(uid, sid, appName, shareUid, info, time) {
        this.app.getLogger('debugLogger').info(`进入service耗时 ${Date.now() - time} ms`);
        this.logger.info("登陆时的参数 ：" + uid + " " + sid);
        let result = {};
        let third = false;
        let sdkui = await this.ctx.model.WeChatModel.SdkUser.findOne({ userid: uid });
        this.app.getLogger('debugLogger').info(`查询是否是第三方登录耗时 ${Date.now() - time} ms`);
        if(sdkui) {
            if(!sdkui.sessionKey || !sdkui.unionid) {
                if(sdkui.authNumber && sdkui.authNumber < 3) {
                    result.info = null;
                    return result;
                }
                await this.ctx.model.WeChatModel.SdkUser.update({ userid: uid },
                    { $set: { authNumber: 1 } });
            }
            third = true;
            // try {
            //     if(info.encryptedData) {
            //         let pc = new WXBizDataCrypt(this.config.appid, sdkui.sessionKey);
            //         info = pc.decryptData(info.encryptedData, info.iv);
            //          this.logger.info("解密的数据", info);
            //         this.app.getLogger('debugLogger').info(`解密耗时 ${Date.now() - time} ms`);
            //     }
            // }catch (e) {
            //     this.logger.error(e)
            // }
        }
        //老用户登陆
        if (sid) {
            let authUi = await this.collect(sid, appName, time);
            this.app.getLogger('debugLogger').info(`老用户登录耗时 ${Date.now() - time} ms`);
            if (authUi == null) {
                let loginUser = await this.ctx.model.PublicModel.User.findOne({ uid: uid, appName: appName });
                if (loginUser != null) {
                    this.logger.info("通过openid查库 ：" + loginUser.uid + "昵称 ：" + loginUser.nickName);
                    let _sid = this.GEN_SID(loginUser.pid);
                    this.recruitSid(_sid, loginUser.pid);
                    this.app.getLogger('debugLogger').info(`错误sid 刷新耗时 ${Date.now() - time} ms`);
                    this.logger.info("老用户刷新SID ：" + _sid);
                    result.sid = _sid;
                }
                result.info = loginUser;
            } else {
                this.logger.info("老用户登陆  uid：" + authUi.uid + " 老用户的昵称 ：" + authUi.nickName);
                if (uid && authUi.uid != uid) {
                    result.info = null;
                } else {
                    result.sid = sid;
                    result.info = authUi;
                }
            }
            if(shareUid && uid != shareUid && result.info) {
                let friendsSet = new Set(result.info.friendList);
                if(!friendsSet.has(shareUid)) {
                    let update = await this.ctx.model.PublicModel.User.update({ uid: shareUid }, { $addToSet: { friendList: result.info.uid } });
                    if(update.nModified) {
                        await this.ctx.model.PublicModel.User.update({ uid: result.info.uid }, { $addToSet: { friendList: shareUid } });
                    }
                    this.app.getLogger('debugLogger').info(`添加分享用户 ${Date.now() - time} ms`);
                }
            }
            let updateInfo = {
                nickName: info.nickName,
                avatarUrl: info.avatarUrl,
                gender: info.gender,
                city: info.city,
                province: info.province,
                country: info.country,
                lastLogin: new Date(),
            }
            if(result.info) {
                if(!result.info.third && third) {
                    updateInfo.third = true;
                }
              //  this.app.getLogger('debugLogger').info(`what??耗时 ${Date.now() - time} ms`);
                this.ctx.runInBackground(async () => {
                  //  this.app.getLogger('debugLogger').info(`会进来??耗时 ${Date.now() - time} ms`);
                     await this.ctx.model.PublicModel.User.update({ uid: uid, appName: appName }, {
                        $set: updateInfo,
                    });
                   // this.app.getLogger('debugLogger').info(`什么鬼??耗时 ${Date.now() - time} ms`);
                });
                result.info.nickName = info.nickName;
                result.info.avatarUrl = info.avatarUrl;
                this.app.getLogger('debugLogger').info(`sid 老用户信息更新耗时 ${Date.now() - time} ms`);
            }
            return result;

        }
        //第三方登陆
        let ui = null;
        if (uid) {
            // let sdkui = await this.ctx.model.WeChatModel.SdkUser.findOne({userid: uid});
            // let third = false;
            // if (!sdkui) {
            //     this.logger.error(uid + " 尝试无效的第三方登陆");
            //     // result.info = null;
            //     // return result;
            // }else{
            //     this.logger.info("第三方登陆 ：" + JSON.stringify(sdkui));
            //     third = true;
            // }

            // 因为以后登陆仅仅通过sid，所以安全问题能得以提高
            ui = await this.ctx.model.PublicModel.User.findOne({
                uid: uid,
                appName: appName,
                //third: true,
            });
            this.app.getLogger('debugLogger').info(`sid不存在，uid存在查询用户信息耗时  ${Date.now() - time} ms`);
            if (!ui) {
                // 自动注册
                ui = await this.register(uid, info, third, appName, shareUid, time);
                this.app.getLogger('debugLogger').info(`注册耗时  ${Date.now() - time} ms`);
                let sid = this.GEN_SID(ui.pid);
                this.logger.info("使用第三方凭据注册账号 " + ui.pid + " sid : " + sid);
                this.recruitSid(sid, ui.pid);
                this.app.getLogger('debugLogger').info(`注册刷新sid耗时  ${Date.now() - time} ms`);
            } else {
                //更新一次userInfo
                this.ctx.runInBackground(async () => {
                    await this.ctx.model.PublicModel.User.update({ uid: uid, appName: appName }, {
                        $set: {
                            nickName: info.nickName,
                            avatarUrl: info.avatarUrl,
                            gender: info.gender,
                            city: info.city,
                            province: info.province,
                            country: info.country,
                            lastLogin: new Date(),
                        },
                    });
                })
                ui.nickName = info.nickName;
                ui.avatarUrl = info.avatarUrl;
                this.app.getLogger('debugLogger').info(`刷新用户信息耗时  ${Date.now() - time} ms`);
            }
        }

        let ses = JSON.parse(await this.app.redis.get(ui.pid));

        if (ses) {
            let now = new Date().getTime();
            if (ses.expire < now) {
                ses.sid = this.GEN_SID(ui.pid); // 过期重新生成
                this.recruitSid(ses.sid, ui.pid);
            }
            this.app.getLogger('debugLogger').info(`检验sid时效耗时  ${Date.now() - time} ms`);
        }

        //this.logger.info(JSON.stringify(ses));


        this.logger.info("{{=it.user}}@{{=it.sid}} 登陆成功", { user: ui.pid, sid: ses.sid });

        // 日志
        this.ctx.model.PublicModel.UserActionRecord.create({
            pid: ui.pid,
            appName: appName,
            type: constant.UserActionRecordType.LOGIN,
            data: {
                agent: this.ctx.request.header['user-agent'],
                host: this.ctx.request.header.host,
                addr: (this.ctx.request.socket.remoteAddress).replace("::ffff:", ""),
            },
            createDate: new Date(),
        });

        result.sid = ses.sid;
        result.info = ui;



        return result;
    }
    //每日首次分享奖励
    async dayShareReward(ui, itemId, itemCnt) {
        let uid = ui.uid;
        let today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0, 1);
        let isFirst = false;
        let shareRcd = await this.ctx.model.PublicModel.UserShareRecord.findOne({ uid: uid, createDate: { $gte: today } });
        if (shareRcd) {

            this.logger.info(shareRcd, '非第一次分享，不发奖励');
            //更新分享次数
            await this.ctx.model.PublicModel.UserShareRecord.update({ _id: shareRcd._id }, { $inc: { num: 1 } });
        } else {

            isFirst = true;
            //发奖励
            await this.ctx.service.publicService.itemService.itemChange(ui.uid, { ["items." + itemId]: itemCnt }, 'firstShare');

            this.logger.info(`用户${uid}获得今日首次分享奖励->${itemId}x${itemCnt}个`);
            //插入分享记录
            await this.ctx.model.PublicModel.UserShareRecord.create({
                uid: uid,
                appName: 'travel',
                createDate: new Date(),
                num: itemCnt,
                getItem: true,
                itemId: itemId,
            });

            //通知到消息中心
            let content = travelConfig.Message.Get(travelConfig.Message.SHAREMESSAGE).content;
            content = content.replace("s%", itemCnt);
            this.logger.info(content);
            await this.ctx.model.TravelModel.UserMsg.create({
                uid: uid,
                mid: "msg" + travelConfig.Message.SHAREMESSAGE + new Date().getTime(),
                type: travelConfig.Message.SHAREMESSAGE,
                title: travelConfig.Message.Get(travelConfig.Message.SHAREMESSAGE).topic,
                content: content,
                date: new Date(),
            })
        }

        return isFirst;
    }
    //带来一个新用户奖励
    async newUserShareReward(uid, itemId, itemCnt) {
        //直接发奖励
        await this.ctx.service.publicService.itemService.itemChange(uid, { ["items." + itemId]: itemCnt }, 'newUserShare');
        //通知到消息中心
        let content = travelConfig.Message.Get(travelConfig.Message.INVITEMESSAGE).content;
        content = content.replace("s%", itemCnt);
        await this.ctx.model.TravelModel.UserMsg.create({
            uid: uid,
            mid: "msg" + travelConfig.Message.INVITEMESSAGE + new Date().getTime(),
            type: travelConfig.Message.INVITEMESSAGE,
            title: travelConfig.Message.Get(travelConfig.Message.INVITEMESSAGE).topic,
            content: content,
            date: new Date(),
        })
    }


    async collect(sid, appName, time) {
        let ui = await this.findUserBySid(sid);
        this.app.getLogger('debugLogger').info(`缓存查询耗时 ${Date.now() - time} ms`);
        if (ui) {
            // 续约
            this.recruitSid(sid, ui.pid);
            this.app.getLogger('debugLogger').info(`sid续约耗时 ${Date.now() - time} ms`);
            // 纪录访问
            this.ctx.model.PublicModel.UserActionRecord.create({
                pid: ui.pid,
                appName: appName,
                type: constant.UserActionRecordType.LOGIN,
                data: {
                    agent: this.ctx.request.header['user-agent'],
                    host: this.ctx.request.header.host,
                    addr: (this.ctx.request.socket.remoteAddress).replace("::ffff:", ""),
                },
                createDate: new Date(),
            });
            this.app.getLogger('debugLogger').info(`用户行为记录耗时  ${Date.now() - time} ms`);
        }else{
            this.logger.error("提供了一个错误的sid {{=it.sid}}", { sid: sid });
        }
        return ui;

    }

    // @third 是否是第三方登陆
    async register(uid, info, third, appName, shareUid, time) {
        // 生成pid

        let pid = await this.app.redis.incr("travel_userid");

        this.logger.info("注册信息 ：uid: " + uid + " pid :" + pid + "昵称 ： " + info.nickName);
        // 新建用户
        let items = constant.AppItem[appName] || {};
        let pidStr = constant.PID_INIT[appName] + pid;
        let ui = await this.ctx.model.PublicModel.User.update({ uid: uid }, {
            uid: uid,
            appName: appName,
            nickName: info.nickName,
            avatarUrl: info.avatarUrl,
            gender: info.gender,
            city: info.city,
            province: info.province,
            country: info.country,
            registertime: new Date(),
            third: third,
            pid: pidStr,
            items: items,
            lastLogin: new Date(),
        }, { upsert: true });
        this.app.getLogger('debugLogger').info(`用户创建耗时  ${Date.now() - time} ms`);
        this.ctx.service.publicService.itemService.itemChange(ui.uid, { ["items." + travelConfig.Item.GOLD ]: travelConfig.Parameter.Get(travelConfig.Parameter.USERGOLD).value }, "origin");
       // this.ctx.service.publicService.itemService.itemChange(ui.uid, { ["items." + travelConfig.Item.GOLD ]: 100000 }, "origin");
        this.app.getLogger('debugLogger').info(`道具初始化耗时  ${Date.now() - time} ms`);

        this.ctx.runInBackground(async () => {
            //进入积分榜单
            await this.ctx.model.TravelModel.IntegralRecord.update({ uid: uid }, {
                uid: uid,
                integral: 0,
                updateDate: new Date(),
            }, { upsert: true });
            //进入足迹榜
            await this.ctx.model.TravelModel.FootRecord.update({ uid: uid}, {
                uid: uid, //玩家uid
                updateDate: new Date(), //更新时间
            }, { upsert: true });
            this.app.getLogger('debugLogger').info(`积分榜单生成耗时  ${Date.now() - time} ms`);
            this.app.getLogger('debugLogger').info(`足迹榜单生成  ${Date.now() - time} ms`);
        })

      //  let key = "lightCity" + 0;
     //   this.app.redis.setnx(key, 0);


        //设置点亮城市段集
     //   await this.app.redis.incr(key);
        // 日志
        this.ctx.model.PublicModel.UserActionRecord.create({
            pid: pid,
            type: constant.UserActionRecordType.REGISTER,
            appName: appName,
            createDate: new Date(),
        });

        shareUid && uid != shareUid && await this.newUserShareReward(shareUid, travelConfig.Item.GOLD, travelConfig.Parameter.Get(travelConfig.Parameter.NEWUSERGOLD).value);
        this.app.getLogger('debugLogger').info(`分享获得奖励耗时  ${Date.now() - time} ms`);
        if(shareUid && uid != shareUid) {
            let update = await this.ctx.model.PublicModel.User.update({ uid: shareUid }, { $addToSet: { friendList: uid } });
            if(update.nModified) {
                await this.ctx.model.PublicModel.User.update({ uid: uid }, { $addToSet: { friendList: shareUid } });
            }
            this.app.getLogger('debugLogger').info(`注册加好友耗时  ${Date.now() - time} ms`);
        }

        return ui;
    }

    recruitSid(sid, pid) {
        let session = {
            pid: pid,
            sid: sid,
            expire: new Date().getTime() + this.config.session.maxAge,
        };
        this.logger.info("存储session : " + JSON.stringify(session));
        this.app.redis.set(pid, JSON.stringify(session));
        this.app.redis.set(sid, JSON.stringify(session));
    }


    async findUserBySid(sid) {
        try{
            // 通过sid查找pid，再通过pid查找info
            let ses = JSON.parse(await this.app.redis.get(sid));
            if (ses == null) {
                return null;
            }
            this.logger.info("用户PID: " + ses.pid);
            return await this.ctx.model.PublicModel.User.findOne({ pid: ses.pid });
        }catch(err) {
            this.logger.error(err);
            return null;
        }


    }


    GEN_SID(pid) {
        return crypto.createHash('md5').update(pid + new Date().getTime().toString()).digest('hex');
    }


}


module.exports = UserService;

