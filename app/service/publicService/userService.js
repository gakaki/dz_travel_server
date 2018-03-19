const Service = require('egg').Service;

const constant = require('../../utils/constant');
const crypto = require("crypto");
module.exports = app => {
    return class UserService extends Service {

        async login(param) {
            let uid = param.uid;
            let sid = param._sid;
            let appName = param.appName;
            this.logger.info("登陆时的参数 ：" + uid + " " + sid);
            let result = {};
            //老用户登陆
            if (sid) {
                let authUi = await this.collect(sid, appName);
                this.logger.info("老用户登陆 ：" + JSON.stringify(authUi));
                if (authUi == null) {
                    let loginUser = await this.ctx.model.PublicModel.User.findOne({uid: uid});
                    this.logger.info("通过openid查库 ：" + JSON.stringify(loginUser));
                    if (loginUser != null) {
                        let sid = this.GEN_SID();
                        this.recruitSid(sid, loginUser.pid);
                        this.logger.info("老用户刷新SID ：" + sid);

                    }
                    result.sid = sid;
                    result.info = loginUser;
                    return result;

                } else {
                    result.sid = sid;
                    result.info = authUi;
                    return result;
                }

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
                    third: true
                });

                if (!ui) {
                    // 自动注册
                    ui = await this.register(uid, JSON.parse(param.info).nickName, JSON.parse(param.info).avatarUrl, true, appName);
                    let sid = this.GEN_SID();
                    this.logger.info("使用第三方凭据注册账号 " + ui.pid + " sid : " + sid);
                    this.recruitSid(sid, ui.pid);
                } else {
                    //更新一次userInfo
                    await this.ctx.model.PublicModel.User.update({pid: ui.pid}, {
                        $set: {
                            nickName: JSON.parse(param.info).nickName,
                            avatarUrl: JSON.parse(param.info).avatarUrl
                        }
                    });
                    ui = await this.ctx.model.PublicModel.User.findOne({
                        uid: uid,
                        third: true
                    });
                }
            }

            let ses = JSON.parse(await app.redis.get(ui.pid));

            if (ses) {
                let now = new Date().getTime();
                if (ses.expire < now) {
                    ses.sid = this.GEN_SID(); // 过期重新生成
                    this.recruitSid(ses.sid, ui.pid);
                }
            }


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
                }
            });

            result.sid = ses.sid;
            result.info = ui;

            return result;
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
                    }
                });
                return ui;
            }
            else {
                this.logger.error("提供了一个错误的sid {{=it.sid}}", {sid: sid});
                return null;
            }

        }

        // @third 是否是第三方登陆
        async register(uid, nickname, avatar, third, appName) {
            // 生成pid
            let count = await this.ctx.model.PublicModel.User.count({appName: appName});
            let pid = count + 1;
            // 新建用户
            let items = constant.AppItem[appName] || {};
            let pidStr = constant.PID_INIT[appName] + pid;
            let character = constant.AppCharacter[appName] || {};
            let ui = await this.ctx.model.PublicModel.User.create({
                uid: uid,
                appName: appName,
                nickName: nickname,
                avatarUrl: avatar,
                registertime: new Date().toLocaleString(),
                third: third,
                pid: pidStr,
                items: items,
                character: character,
                newUser: true
            });


            // 日志
            this.ctx.model.PublicModel.UserActionRecord.create({
                pid: pid,
                type: constant.UserActionRecordType.REGISTER,
                appName: appName
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
            app.redis.set(pid, JSON.stringify(session));
            app.redis.set(sid, JSON.stringify(session));
        }


        async findUserBySid(sid) {
            // 通过sid查找pid，再通过pid查找info
            let ses = JSON.parse(await app.redis.get(sid));
            if (ses == null) {
                return null;
            }
            return await this.ctx.model.PublicModel.User.findOne({pid: ses.pid});
        }

        async getPlayerCnt() {
            let cnt = await this.ctx.model.UserActionRecord.PublicModel.count();
            return cnt;
        }


        GEN_SID() {
            return crypto.createHash('md5').update(Math.random().toString()).digest('hex');
        };


    }
};

