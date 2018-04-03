const Service = require('egg').Service;

const constant = require('../../utils/constant');
const crypto = require("crypto");
const travelConfig = require("../../../sheets/travel");


class UserService extends Service {

    async login(uid, sid, appName, shareUid, info) {
        this.logger.info("登陆时的参数 ：" + uid + " " + sid);
        let result = {};
        //老用户登陆
        if (sid) {
            let authUi = await this.collect(sid, appName);
            if (authUi == null) {
                let loginUser = await this.ctx.model.PublicModel.User.findOne({uid: uid, appName: appName});
                if (loginUser != null) {
                    this.logger.info("通过openid查库 ：" + loginUser.uid + "昵称 ：" + loginUser.nickName);
                    let _sid = this.GEN_SID();
                    this.recruitSid(_sid, loginUser.pid);
                    this.logger.info("老用户刷新SID ：" + _sid);

                    await this.ctx.model.PublicModel.User.update({pid: loginUser.pid, appName: appName}, {
                        $set: {
                            nickName: info.nickName,
                            avatarUrl: info.avatarUrl,
                            gender: info.gender,
                            city: info.city,
                            province: info.province,
                            country: info.country,
                        }
                    });
                    result.sid = _sid;
                }
                result.info = loginUser;

            } else {

                this.logger.info("老用户登陆  uid：" + authUi.uid + " 老用户的昵称 ：" + authUi.nickName);
                if (uid && authUi.uid != uid) {
                    result.info = null;
                }
                else {

                    await this.ctx.model.PublicModel.User.update({pid: authUi.pid, appName: appName}, {
                        $set: {
                            nickName: info.nickName,
                            avatarUrl: info.avatarUrl,
                            gender: info.gender,
                            city: info.city,
                            province: info.province,
                            country: info.country,
                        }
                    });

                    result.sid = sid;
                    result.info = authUi;
                }
            }

            //分享奖励
            if (shareUid && shareUid != authUi.uid) {

                await this.dayShareReward(shareUid,travelConfig.Item.GOLD, travelConfig.Parameter.Get(travelConfig.Parameter.SHAREGOLD).value)
            }
            return result;

        }
        //第三方登陆
        let ui = null;
        if (uid) {
            let sdkui = await this.ctx.model.WeChatModel.SdkUser.findOne({userid: uid});
            this.logger.info("第三方登陆 ：" + JSON.stringify(sdkui));
            if (!sdkui) {
                this.logger.error("尝试无效的第三方登陆");
                result.info = null;
                return result;
            }

            // 因为以后登陆仅仅通过sid，所以安全问题能得以提高
            ui = await this.ctx.model.PublicModel.User.findOne({
                uid: uid,
                appName: appName,
                third: true
            });

            if (!ui) {
                // 自动注册
                ui = await this.register(uid, info, true, appName);
                let sid = this.GEN_SID();
                this.logger.info("使用第三方凭据注册账号 " + ui.pid + " sid : " + sid);
                this.recruitSid(sid, ui.pid);
            } else {
                //更新一次userInfo
                await this.ctx.model.PublicModel.User.update({pid: ui.pid, appName: appName}, {
                    $set: {
                        nickName: info.nickName,
                        avatarUrl: info.avatarUrl,
                        gender: info.gender,
                        city: info.city,
                        province: info.province,
                        country: info.country,
                    }
                });
                ui = await this.ctx.model.PublicModel.User.findOne({
                    uid: uid,
                    appName: appName,
                    third: true
                });
            }
        }

        let ses = JSON.parse(await this.app.redis.get(ui.pid));

        if (ses) {
            let now = new Date().getTime();
            if (ses.expire < now) {
                ses.sid = this.GEN_SID(); // 过期重新生成
                this.recruitSid(ses.sid, ui.pid);
            }
        }

        this.logger.info(JSON.stringify(ses));


        this.logger.info("{{=it.user}}@{{=it.sid}} 登陆成功", {user: ui.pid, sid: ses.sid});

        // 日志
        this.ctx.model.PublicModel.UserActionRecord.create({
            pid: ui.pid,
            appName: appName,
            type: constant.UserActionRecordType.LOGIN,
            data: {
                agent: this.ctx.request.header['user-agent'],
                host: this.ctx.request.header.host,
                addr: (this.ctx.request.socket.remoteAddress).replace("::ffff:", "")
            },
            createDate:new Date()
        });

        result.sid = ses.sid;
        result.info = ui;

        shareUid && await this.newUserShareReward(shareUid, travelConfig.Item.GOLD, travelConfig.Parameter.Get(travelConfig.Parameter.NEWUSERGOLD).value);

        return result;
    }
    //每日首次分享奖励
    async dayShareReward(uid, itemId, itemCnt) {

    }
    //带来一个新用户奖励
    async newUserShareReward(uid, itemId, itemCnt) {

    }


    async collect(sid, appName) {
        let ui = await this.findUserBySid(sid);
        if (ui) {
            // 续约
            this.recruitSid(sid, ui.pid);
            // 纪录访问
            await this.ctx.model.PublicModel.UserActionRecord.create({
                pid: ui.pid,
                appName: appName,
                type: constant.UserActionRecordType.LOGIN,
                data: {
                    agent: this.ctx.request.header['user-agent'],
                    host: this.ctx.request.header.host,
                    addr: (this.ctx.request.socket.remoteAddress).replace("::ffff:", "")
                },
                createDate:new Date()
            });
            return ui;
        }
        else {
            this.logger.error("提供了一个错误的sid {{=it.sid}}", {sid: sid});
            return null;
        }

    }

    // @third 是否是第三方登陆
    async register(uid, info, third, appName) {
        // 生成pid

        let pid = await this.app.redis.incr("travel_userid");

        this.logger.info("注册信息 ：uid: " + uid + " pid :" + pid + "昵称 ： " + info.nickName);
        //let  random = uid.replace(/[^0-9]/ig,"");
        // 新建用户
        let items = constant.AppItem[appName] || {};
        let pidStr = constant.PID_INIT[appName] + pid;
        items[travelConfig.Item.GOLD] = travelConfig.Parameter.Get(travelConfig.Parameter.USERGOLD).value;
        let ui = await this.ctx.model.PublicModel.User.create({
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
        });

        this.ctx.service.publicService.itemService.itemChange(ui,  {["items."+travelConfig.Item.GOLD] :  travelConfig.Parameter.Get(travelConfig.Parameter.USERGOLD).value}, "travel");

        // 日志
        this.ctx.model.PublicModel.UserActionRecord.create({
            pid: pid,
            type: constant.UserActionRecordType.REGISTER,
            appName: appName,
            createDate:new Date()
        });

        return ui;
    }

    recruitSid(sid, pid) {
        let session = {
            pid: pid,
            sid: sid,
            expire: new Date().getTime() + this.config.session.maxAge
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
            return await this.ctx.model.PublicModel.User.findOne({pid: ses.pid});
        }catch(err){
            this.logger.error(err);
            return null;
        }


    }


    GEN_SID() {
        return crypto.createHash('md5').update(new Date().getTime().toString()).digest('hex');
    };


}


module.exports = UserService;

