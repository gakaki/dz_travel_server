const Controller = require('egg').Controller;
const constant = require("../../utils/constant");
const englishConfigs = require("../../../sheets/english");

class EnglishController extends Controller {
    async showpersonal(ctx) {
        const {_sid, appName} = ctx.query;
        let result = {};
        if (!_sid || !appName) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        let show = await this.service.englishService.englishService.showPersonal(ui, appName);
        result.code = constant.Code.OK;
        result.data = show;
        ctx.body = result;
    }

    async getseason(ctx) {
        const {_sid, appName, position} = ctx.query;
        let result = {};
        if (!_sid || !appName) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        let season = await this.service.englishService.englishService.getSeason();
        result.code = constant.Code.OK;
        result.data = {
            season: season
        };
        ctx.body = result;
    }

    async updateposition(ctx) {
        const {_sid, appName, position} = ctx.query;
        let result = {};
        if (!_sid || !appName || !position) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        let user = await this.service.englishService.englishService.updatePosition(ui, appName, position);
        result.code = constant.Code.OK;
        result.data = user;
        ctx.body = result;
    }

    async isfirstsign(ctx) {
        const {_sid, appName} = ctx.query;
        let result = {};
        if (!_sid || !appName) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        ctx.logger.info("我要判断是否首次签到");
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        let sign = await this.service.englishService.englishService.isFirstSign(ui, appName);
        result.code = constant.Code.OK;
        result.data = sign;

        ctx.body = result;
    }

    async signin(ctx) {
        const {_sid, appName} = ctx.query;
        let result = {};
        if (!_sid || !appName) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        ctx.logger.info("我要签到");
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        let award = await this.service.englishService.englishService.signIn(ui, appName);
        if (award != null) {
            result.code = constant.Code.OK;
            result.data = award;
        } else {
            result.code = constant.Code.REQUIREMENT_FAILED;
        }

        ctx.body = result;
    }

    async canshare(ctx) {
        const {_sid, appName} = ctx.query;
        let result = {};
        if (!_sid || !appName) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        ctx.logger.info("是否可以分享");
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        let canShare = await this.service.englishService.englishService.canShare(ui, appName);
        result.code = constant.Code.OK;
        result.data = canShare;
        ctx.body = result;
    }

    async getshareaward(ctx) {
        const {_sid, appName} = ctx.query;
        let result = {};
        if (!_sid || !appName) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        ctx.logger.info("分享的奖励");
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        let award = await this.service.englishService.englishService.getShareAward(ui, appName);
        if (award.getItem) {
            result.code = constant.Code.OK;
            result.data = award;
        } else {
            result.code = constant.Code.REQUIRED_LOST;
        }
        ctx.body = result;
    }


    async canmatch(ctx) {
        const {_sid, appName, rankType} = ctx.query;
        let result = {};
        if (!_sid || !appName || !rankType) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        let data = await this.service.englishService.englishService.isInRoom(ui, appName, rankType);

        result.code = constant.Code.OK;
        result.data = data;

        ctx.body = result;
    }

    async checkroom(ctx) {
        const {_sid, appName, rid} = ctx.query;
        let result = {};
        ctx.logger.info("检查房间 入参 ：" + rid);
        if (!_sid || !appName || !rid) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        let data = await this.service.englishService.englishService.checkRoom(ui, appName, rid);

        result.code = constant.Code.OK;
        result.data = data;

        ctx.body = result;
    }


    async roomisexist(ctx) {
        const {_sid, appName, rid} = ctx.query;
        let result = {};
        if (!_sid || !appName || !rid) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        let room = await this.service.englishService.englishService.roomIsExist(ui, appName, rid);

        if (room) {
            result.code = constant.Code.OK;
            result.data = {
                roomStatus: room.roomStatus
            }
        } else {
            result.code = constant.Code.ROOM_EXPIRED;
        }
        ctx.body = result;
    }

    async makesurprise(ctx) {
        const {_sid, appName, itemId} = ctx.query;
        let result = {};
        if (!_sid || !appName || !itemId) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        if (!englishConfigs.Item.Get(itemId) || englishConfigs.Item.Get(itemId).ifuse == -1) {
            result.code = constant.Code.REQUIREMENT_FAILED;
            ctx.body = result;
            return
        }
        if (ui.items[itemId] <= 0) {
            result.code = constant.Code.NEED_ITEMS;
            ctx.body = result;
            return
        }

        let dropItem = await this.service.englishService.englishService.makeSurprise(ui, appName, itemId);
        result.code = constant.Code.OK;
        result.data = dropItem;
        ctx.body = result;
    }

    async develop(ctx) {
        const {_sid, appName} = ctx.query;
        let result = {};
        if (!_sid || !appName) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        ctx.logger.info("养成系统");
        let dev = await this.service.englishService.englishService.develop(ui, appName);
        result.code = constant.Code.OK;
        result.data = dev;
        ctx.body = result;
    }

    async speechlevelup(ctx) {
        const {_sid, appName, spid} = ctx.query;
        let result = {};
        if (!_sid || !appName || !spid) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        ctx.logger.info("道具编号 ：" + spid);
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        if (ui.character.developSystem[spid].level == englishConfigs.Speech.Get(spid).endlevel) {
            ctx.logger.info("等级最大了");
            result.code = constant.Code.LEVEL_MAX;
            ctx.body = result;
            return;
        }

        let r = await this.service.englishService.englishService.speechLevelUp(ui, spid, appName);
        if (r != null) {
            result.code = constant.Code.OK;
            result.data = r;
        } else {
            result.code = constant.Code.NEED_ITEMS;
        }

        ctx.body = result;
    }


    async getfriendrankinglist(ctx) {
        const {_sid, appName} = ctx.query;
        let result = {};
        if (!_sid || !appName) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        let friendList = await this.service.englishService.englishService.getFriendRankingList(ui, appName);
        result.code = constant.Code.OK;
        result.data = friendList;
        ctx.body = result;
    }


    async getworldrankinglist(ctx) {
        const {_sid, appName, season} = ctx.query;
        let result = {};
        if (!_sid || !appName || !season) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }


        let ui = await this.service.publicService.userService.findUserBySid(_sid);
        if (ui == null) {
            result.code = constant.Code.USER_NOT_FOUND;
            ctx.body = result;
            return;
        }
        let worldList = await this.service.englishService.englishService.getWorldRankingList(appName, Number(season));
        if (worldList != null) {
            result.code = constant.Code.OK;
            result.data = worldList;
        } else {
            result.code = constant.Code.REQUIRED_LOST;
        }

        ctx.body = result;
    }

    setquestions(ctx) {
        const {difficult} = ctx.query;
        let result = {};
        if (!difficult) {
            result.code = constant.Code.PARAMETER_NOT_MATCH;
            ctx.body = result;
            return;
        }
        ctx.body = this.service.englishService.englishService.setQuestions(difficult);
    }


}

module.exports = EnglishController;
