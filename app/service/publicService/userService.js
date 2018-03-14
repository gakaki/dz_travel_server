const Service = require('egg').Service;

const constant = require('../../utils/constant');
const crypto = require("crypto");

const PID_INIT=160000;

class UserService extends Service {

    async login(uid,sid,appName,info) {
        this.logger.info("登陆时的参数 ：" + uid + " " + sid);
        let result = {};
        //老用户登陆
        if (sid) {
            let authUi = await this.collect(sid, appName);
            this.logger.info("老用户登陆 ：" + JSON.stringify(authUi));
            if (authUi == null) {
                let loginUser = await this.ctx.model.PublicModel.User.findOne({uid: uid,appName:appName});
                this.logger.info("通过openid查库 ：" + JSON.stringify(loginUser));
                if (loginUser != null) {
                    let _sid = this.GEN_SID();
                    this.recruitSid(_sid, loginUser.pid);
                    this.logger.info("老用户刷新SID ：" + _sid);

                    await this.ctx.model.PublicModel.User.update({pid: loginUser.pid,appName:appName}, {
                        $set: {
                            nickName:info.nickName,
                            avatarUrl:info.avatarUrl,
                            gender:info.gender,
                            city:info.city,
                            province:info.province,
                            country:info.country,
                        }
                    });
                    result.sid = _sid;
                }
                result.info = loginUser;
                return result;

            } else {
                if(uid && authUi.uid != uid){
                    result.info = null;
                    return result;
                }
                await this.ctx.model.PublicModel.User.update({pid: authUi.pid,appName:appName}, {
                    $set: {
                        nickName:info.nickName,
                        avatarUrl:info.avatarUrl,
                        gender:info.gender,
                        city:info.city,
                        province:info.province,
                        country:info.country,
                    }
                });

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
                appName:appName,
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
                await this.ctx.model.PublicModel.User.update({pid: ui.pid,appName:appName}, {
                    $set: {
                        nickName:info.nickName,
                        avatarUrl:info.avatarUrl,
                        gender:info.gender,
                        city:info.city,
                        province:info.province,
                        country:info.country,
                    }
                });
                ui = await this.ctx.model.PublicModel.User.findOne({
                    uid: uid,
                    appName:appName,
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
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
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
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
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
    async register(uid, info, third, appName) {
        // 生成pid
        let users = await this.ctx.model.PublicModel.User.find({appName: appName}).sort({pid:1});
        let pid = PID_INIT;
        if(users.length >0){
             pid = Number(users.pop().pid) + 1;
        }else{
             pid = 1 +PID_INIT;
        }

        //let  random = uid.replace(/[^0-9]/ig,"");
        // 新建用户
        let items = constant.AppItem[appName] || {};
        let pidStr = constant.PID_INIT[appName] + pid;
        let character = constant.AppCharacter[appName] || {};
        let ui = await this.ctx.model.PublicModel.User.create({
            uid: uid,
            appName: appName,
            nickName: info.nickName,
            avatarUrl: info.avatarUrl,
            gender:info.gender,
            city:info.city,
            province:info.province,
            country:info.country,
            registertime: new Date().toLocaleString(),
            third: third,
            pid: pidStr,
            items: items,
            character: character
        });


        // 日志
        this.ctx.model.PublicModel.UserActionRecord.create({
            pid: pid,
            type: constant.UserActionRecordType.REGISTER,
            appName: appName,
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
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
        // 通过sid查找pid，再通过pid查找info
        let ses = JSON.parse(await this.app.redis.get(sid));
        if (ses == null) {
            return null;
        }
        this.logger.info("用户PID: " + ses.pid);
        return await this.ctx.model.PublicModel.User.findOne({pid: ses.pid});
    }


    GEN_SID() {
        return crypto.createHash('md5').update(new Date().getTime().toString()).digest('hex');
    };


}


module.exports = UserService;

