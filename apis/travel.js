//-------------enums---------------
class Season{
    
    static get SPRING() { return '春';}
    
    static get SUMMER() { return '夏';}
    
    static get AUTUMN() { return '秋';}
    
    static get WINTER() { return '冬';}
    
}
class PresentTktType{
    
    static get SINGLE() { return 1;}
    
    static get DOUBLE() { return 2;}
    
}
class Code{
    
    static get AUTH_FAILED() { return -99;}
    
    static get LOGIN_FAILED() { return -100;}
    
    static get USER_EXISTS() { return -101;}
    
    static get LOGIN_EXPIRED() { return -102;}
    
    static get ANNOYMOUS_DENY() { return -103;}
    
    static get USER_NOT_FOUND() { return -104;}
    
    static get VERIFY_FAILED() { return -105;}
    
    static get ROOMID_FAILED() { return -106;}
    
    static get FRIEND_WAIT() { return -107;}
    
    static get REQUIREMENT_FAILED() { return -108;}
    
    static get ROOM_FULLED() { return -109;}
    
    static get ROOM_NEED_UPDATE() { return -88;}
    
    static get ROOM_EXPIRED() { return -110;}
    
    static get ROOM_USER_EXISTS() { return -111;}
    
    static get BAG_FULLED() { return -112;}
    
    static get NEED_ITEMS() { return -113;}
    
    static get FRIEND_APPLY() { return -114;}
    
    static get FRIEND_DONE() { return -115;}
    
    static get SPE_LIMIT() { return -116;}
    
    static get PICKED() { return -117;}
    
    static get REQUIRED_LOST() { return -118;}
    
    static get USER_OFFLINE() { return -119;}
    
    static get USER_INTEAM() { return -120;}
    
    static get ANSWER_WRONG() { return -121;}
    
    static get CANNOT_BE_SELF() { return -122;}
    
    static get MUST_FRIEND() { return -127;}
    
    static get ISSHARED() { return -134;}
    
    static get NO_MONEY() { return -136;}
    
    static get EXCEED_COUNT() { return -137;}
    
    static get LESS_MONEY() { return -138;}
    
    static get LEVEL_MAX() { return -140;}
    
    static get ITEM_MAX() { return -141;}
    
    static get ITEM_LESS() { return -142;}
    
    static get NOT_FOUND() { return -10086;}
    
    static get HAS_LIKE() { return -521;}
    
    static get NEED_COUPON() { return -170;}
    
    static get NEED_MONEY() { return -171;}
    
    static get NEED_INTEGRAL() { return -172;}
    
    static get NEED_ADDRESS() { return -173;}
    
    static get NONE_ADDRESS() { return -174;}
    
    static get CANT_BUG() { return -175;}
    
    static get RANK_NOT_MEET() { return 150;}
    
    static get INTEGRAL_NOT_MEET() { return 151;}
    
    static get ALREADY_GOT() { return 152;}
    
    static get HAS_SIGNIN() { return -144;}
    
    static get NO_CURRENTCITY() { return -145;}
    
    static get UNKNOWN() { return -1000;}
    
    static get EXCEPTION() { return -999;}
    
    static get ROUTER_NOT_FOUND() { return -998;}
    
    static get CONTEXT_LOST() { return -997;}
    
    static get MODEL_ERROR() { return -996;}
    
    static get PARAMETER_NOT_MATCH() { return -995;}
    
    static get NEED_AUTH() { return -994;}
    
    static get TYPE_MISMATCH() { return -993;}
    
    static get FILESYSTEM_FAILED() { return -992;}
    
    static get FILE_NOT_FOUND() { return -991;}
    
    static get ARCHITECT_DISMATCH() { return -990;}
    
    static get SERVER_NOT_FOUND() { return -989;}
    
    static get LENGTH_OVERFLOW() { return -988;}
    
    static get TARGET_NOT_FOUND() { return -987;}
    
    static get PERMISSIO_FAILED() { return -986;}
    
    static get WAIT_IMPLEMENTION() { return -985;}
    
    static get ACTION_NOT_FOUND() { return -984;}
    
    static get TARGET_EXISTS() { return -983;}
    
    static get STATE_FAILED() { return -982;}
    
    static get UPLOAD_FAILED() { return -981;}
    
    static get MASK_WORD() { return -980;}
    
    static get PASS_FAILED() { return -978;}
    
    static get OVERFLOW() { return -977;}
    
    static get AUTH_EXPIRED() { return -976;}
    
    static get SIGNATURE_ERROR() { return -975;}
    
    static get WX_REQUEST_ERR() { return -6;}
    
    static get THIRD_FAILED() { return -5;}
    
    static get MULTIDEVICE() { return -4;}
    
    static get HFDENY() { return -3;}
    
    static get TIMEOUT() { return -2;}
    
    static get FAILED() { return -1;}
    
    static get OK() { return 0;}
    
    static get DELAY_RESPOND() { return 10000;}
    
    static get REST_NEED_RELISTEN() { return 10001;}
    
    static get NO_DB_ROW() { return 11001;}
    
    static get NO_CFG_ROW() { return 11002;}
    
}
class RentItem{
    
    static get CAR() { return 1;}
    
    static get CAMERA() { return 2;}
    
    static get MEDICALBOX() { return 3;}
    
}
class SystemGift{
    
    static get USERITEM() { return 1;}
    
    static get SPECIALITY() { return 2;}
    
    static get POSTCARD() { return 3;}
    
    static get RENTITEM() { return 4;}
    
}
class TicketType{
    
    static get RANDOMBUY() { return '00';}
    
    static get SINGLEBUY() { return '01';}
    
    static get DOUBLEBUY() { return '02';}
    
    static get SINGLEPRESENT() { return '11';}
    
    static get DOUBLEPRESENT() { return '12';}
    
}
class RankType{
    
    static get THUMBS() { return 1;}
    
    static get FOOT() { return 2;}
    
    static get SCORE() { return 3;}
    
}
class RankSubtype{
    
    static get COUNTRY() { return 1;}
    
    static get FRIEND() { return 2;}
    
}
class PostType{
    
    static get JINGDIAN() { return 1;}
    
    static get TECHAN() { return 2;}
    
}
class MessageType{
    
    static get POSTCARD() { return 1;}
    
    static get SYSTEM() { return 2;}
    
    static get STRATEGY() { return 3;}
    
    static get RANKREWARD() { return 4;}
    
}
//------------classes--------------
class Partener {
    constructor() {
    
    
        //prop type: string//队员名
        this.nickName = null;
    
        //prop type: number//性别
        this.gender = null;
    
        //prop type: string//头像地址
        this.img = null;
    
        //prop type: boolean//是否是邀请者
        this.isInviter = null;
    
        
        
        
    }
}
class Payload {
    constructor() {
    
    
        //prop type: string
        this.timeStamp = null;
    
        //prop type: string
        this.nonceStr = null;
    
        //prop type: string
        this.package = null;
    
        //prop type: string
        this.signType = null;
    
        //prop type: string
        this.paySign = null;
    
        
        
        
    }
}
class OneDayLog {
    constructor() {
    
    
        //prop type: string
        this.time = null;
    
        //prop type: string[]
        this.spots = null;
    
        
        
        
    }
}
class OneCityLog {
    constructor() {
    
    
        //prop type: string
        this.city = null;
    
        //prop type: string
        this.time = null;
    
        //prop type: 
        this.scenicSpots = null;
    
        
        
        
    }
}
class Log {
    constructor() {
    
    
        //prop type: string
        this.year = null;
    
        //prop type: OneCityLog[]
        this.oneCityLog = null;
    
        
        
        
    }
}
class FriendInfo {
    constructor() {
    
    
        //prop type: string
        this.cid = null;
    
        //prop type: string
        this.cityName = null;
    
        
        
        
    }
}
class ProvencePer {
    constructor() {
    
    
        //prop type: 
        this.proLetter = null;
    
        //prop type: 
        this.proName = null;
    
        //prop type: 
        this.citys = null;
    
        
        
        
    }
}
class CityPer {
    constructor() {
    
    
        //prop type: string//城市id
        this.cityId = null;
    
        //prop type: 
        this.cityname = null;
    
        //prop type: 
        this.cityper = null;
    
        //prop type: 
        this.cityEff = null;
    
        
        
        
    }
}
class UserBriefInfo {
    constructor() {
    
    
        //prop type: string
        this.uid = null;
    
        //prop type: string
        this.nickName = null;
    
        //prop type: string
        this.avatarUrl = null;
    
        
        
        
    }
}
class OtherUserInfo {
    constructor() {
    
    
        //prop type: number
        this.totalIntegral = null;
    
        //prop type: number
        this.mileage = null;
    
        //prop type: number
        this.postcard = null;
    
        //prop type: number
        this.comment = null;
    
        //prop type: number
        this.likeNum = null;
    
        //prop type: number
        this.specialty = null;
    
        
        
        
    }
}
class RealInfo {
    constructor() {
    
    
        //prop type: string
        this.uid = null;
    
        //prop type: string
        this.name = null;
    
        //prop type: string
        this.birthday = null;
    
        //prop type: string
        this.phoneNumber = null;
    
        //prop type: string
        this.address = null;
    
        
        
        
    }
}
class TicketInfo {
    constructor() {
    
    
        //prop type: string
        this.cid = null;
    
        //prop type: string
        this.tid = null;
    
        //prop type: PresentTktType
        this.type = null;
    
        
        
        
    }
}
class Base {
    constructor() {
    
    
        //prop type: string
        this.action = null;
    
        //prop type: number//服务器返回的状态码
        this.code = null;
    
        //prop type: string
        this.uid = null;
    
        //prop type: string
        this._sid = null;
    
        //prop type: Context
        this.ctx = null;
    
        //prop type: string[]
        this.requireFileds = null;
    
        //prop type: string[]
        this.resFields = null;
    
        
        
        
    }
   submit() {
        if (this._submited) {
            return;
        }
        let tmp ={};
        tmp.action=this.action;
        this.resFields.forEach(k => {
           tmp[k]=this[k]
        });
        this.ctx.body ={data: tmp, code: this.code};
        this._submited=true;
    }
   static async checkLogin(res) {
        if (!res.sid) {
            res.code=Code.USER_NOT_FOUND;
            res.submit();
            return;
        }
        let ui=await res.ctx.service.publicService.userService.findUserBySid(res.sid);
        if(!ui){
            res.ctx.logger.info("用户不存在");
            res.code=Code.USER_NOT_FOUND;
            res.submit();
        }
        else {
            res.ui=ui;
        }
        return res;
    }
   parse(data, serverSide=false) {
        Object.assign(this, data);
        for (let f in this.requireFileds) {
            if (!this[f]) {
                break;
                if (serverSide)
                    ctx.body ={code: Code.PARAMETER_NOT_MATCH}
                else {
                    throw new Error('参数不全')
                }
            }
        }
    }
}
class Ws {
    constructor() {
    
    
        
        
        
    }
}
class Http {
    constructor() {
    
    
        
        
        
    }
}
class QuestReport {
    constructor() {
    
    
        //prop type: number
        this.spotCount = null;
    
        //prop type: number
        this.questCount = null;
    
        //prop type: number
        this.postcardCount = null;
    
        
        
        
    }
}
class RouterSpot {
    constructor() {
    
    
        //prop type: boolean
        this.tracked = null;
    
        //prop type: number
        this.index = null;
    
        //prop type: number
        this.arriveStamp = null;
    
        
        
        
    }
}
class TourTask {
    constructor() {
    
    
        //prop type: number[]
        this.spot = null;
    
        //prop type: number[]
        this.tour = null;
    
        //prop type: number[]//0/2
        this.parterTour = null;
    
        //prop type: number[]
        this.photo = null;
    
        //prop type: number[]
        this.parterPhoto = null;
    
        
        
        
    }
}
class oneSpot {
    constructor() {
    
    
        
        
        
    }
}
class Postcard {
    constructor() {
    
    
        //prop type: string
        this.id = null;
    
        //prop type: string
        this.pattern = null;
    
        //prop type: string
        this.picture = null;
    
        //prop type: string
        this.type = null;
    
        
        
        
    }
}
class Quest {
    constructor() {
    
    
        //prop type: number
        this.time = null;
    
        //prop type: string
        this.id = null;
    
        //prop type: string
        this.type = null;
    
        //prop type: string
        this.picture = null;
    
        //prop type: string
        this.describe = null;
    
        //prop type: number
        this.gold_used = null;
    
        //prop type: KV[]
        this.rewards = null;
    
        //prop type: string
        this.question = null;
    
        //prop type: string[]
        this.answers = null;
    
        //prop type: string
        this.rewardCommet = null;
    
        
        
        
    }
}
class EnterSpot {
    constructor() {
    
    
        //prop type: string
        this.id = null;
    
        //prop type: string
        this.scenicspot = null;
    
        //prop type: number
        this.weather = null;
    
        //prop type: number//初始为2，买了增加3次拍照的就加3，买了可以无限拍照的变为-1
        this.freePhoto = null;
    
        //prop type: number
        this.freeSight = null;
    
        //prop type: string
        this.picture = null;
    
        //prop type: string
        this.description = null;
    
        
        
        
    }
}
class Speciality {
    constructor() {
    
    
        //prop type: number//特产id
        this.propId = null;
    
        //prop type: string//特产图片
        this.img = null;
    
        //prop type: string//特产名
        this.name = null;
    
        //prop type: string//特产介绍
        this.desc = null;
    
        //prop type: number//特产价格
        this.price = null;
    
        //prop type: nunber//限购数量
        this.limitNum = null;
    
        
        
        
    }
}
class Event {
    constructor() {
    
    
        //prop type: 
        this.cityname = null;
    
        //prop type: 
        this.cityper = null;
    
        
        
        
    }
}
class Sight {
    constructor() {
    
    
        //prop type: string//景点id
        this.pointId = null;
    
        //prop type: string//返回景点的图片地址
        this.img = null;
    
        
        
        
    }
}
class RankItem {
    constructor() {
    
    
        //prop type: number
        this.rank = null;
    
        //prop type: number
        this.weekAchievement = null;
    
        //prop type: number
        this.achievement = null;
    
        //prop type: UserBriefInfo
        this.userInfo = null;
    
        //prop type: number
        this.reward = null;
    
        
        
        
    }
}
class SelfRank {
    constructor() {
    
    
        //prop type: number
        this.rank = null;
    
        //prop type: number
        this.weekAchievement = null;
    
        //prop type: number
        this.achievement = null;
    
        
        
        
    }
}
class ProvincePostcardInfo {
    constructor() {
    
    
        //prop type: string
        this.url = null;
    
        //prop type: string
        this.province = null;
    
        //prop type: number
        this.collectPostcardNum = null;
    
        //prop type: number
        this.allPostcardNum = null;
    
        
        
        
    }
}
class CityPostcardInfo {
    constructor() {
    
    
        //prop type: string
        this.city = null;
    
        //prop type: number
        this.collectPostcardNum = null;
    
        //prop type: number
        this.allPostcardNum = null;
    
        //prop type: PostcardBriefDetail[]
        this.postcardsDetail = null;
    
        
        
        
    }
}
class PostcardBriefDetail {
    constructor() {
    
    
        //prop type: string
        this.id = null;
    
        //prop type: string
        this.url = null;
    
        //prop type: OneBriefMessage
        this.lastestLiveMessage = null;
    
        
        
        
    }
}
class OneBriefMessage {
    constructor() {
    
    
        //prop type: number
        this.id = null;
    
        //prop type: string
        this.time = null;
    
        //prop type: 
        this.userInfo = null;
    
        //prop type: string
        this.message = null;
    
        
        
        
    }
}
class Post {
    constructor() {
    
    
        //prop type: string//城市id
        this.cityId = null;
    
        //prop type: string//景点或特产id
        this.postId = null;
    
        //prop type: PostType//帖子类型：景点or特产
        this.type = null;
    
        //prop type: string//帖子内容，为景点或特产的介绍
        this.content = null;
    
        //prop type: 
        this.name = null;
    
        //prop type: string//景点或特产图片url
        this.img = null;
    
        //prop type: string//帖子的评分
        this.score = null;
    
        //prop type: number//评论数
        this.commentNum = null;
    
        
        
        
    }
}
class Comment {
    constructor() {
    
    
        //prop type: UserBriefInfo//用户简单信息
        this.user = null;
    
        //prop type: string//评论id
        this.commentId = null;
    
        //prop type: string//评论内容
        this.content = null;
    
        //prop type: number//评论得分
        this.score = null;
    
        //prop type: number//点赞数
        this.thumbs = null;
    
        //prop type: boolean//是否已经点赞
        this.haslike = null;
    
        //prop type: string//创建时间
        this.time = null;
    
        
        
        
    }
}
class MessageItem {
    constructor() {
    
    
        //prop type: number
        this.mid = null;
    
        //prop type: MessageType
        this.type = null;
    
        //prop type: string
        this.title = null;
    
        //prop type: string
        this.date = null;
    
        //prop type: string
        this.content = null;
    
        
        
        
    }
}
class ExchangeShopDetail {
    constructor() {
    
    
        //prop type: string
        this.nickName = null;
    
        //prop type: string
        this.avatarUrl = null;
    
        //prop type: string
        this.shopName = null;
    
        
        
        
    }
}
class Shop {
    constructor() {
    
    
        //prop type: string
        this.id = null;
    
        //prop type: string
        this.pic = null;
    
        //prop type: string
        this.name = null;
    
        //prop type: string
        this.integral = null;
    
        
        
        
    }
}
class FinishGuide extends Base {
    constructor() {
        super();
        this.action = 'tour.finishguide';
    
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = [];
    }
    static Init(ctx, checkLogin = false) {
        let o = new FinishGuide();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class TourIndexInfo extends Base {
    constructor() {
        super();
        this.action = 'tour.tourindexinfo';
    
        this._cid = null;
        this._weather = null;
        this._spots = null;
        this._task = null;
        this._startPos = null;
        this._others = null;
        this._display = null;
        this._startTime = null;
        this._partener = null;
        this.requireFileds = ["cid"];
        this.reqFields = ["cid"];
        this.resFields = ["weather","spots","task","startPos","others","display","startTime","partener"];
    }
    //client input, require, type: number
    get cid() {return this._cid}
    set cid(v) {this._cid = v}
    //server output, type: number
    get weather() {return this._weather}
    set weather(v) {this._weather = v}
    //server output, type: Spot[]
    get spots() {return this._spots}
    set spots(v) {this._spots = v}
    //server output, type: TourTask
    get task() {return this._task}
    set task(v) {this._task = v}
    //server output, type: object
    get startPos() {return this._startPos}
    set startPos(v) {this._startPos = v}
    //server output, type: string[]
    get others() {return this._others}
    set others(v) {this._others = v}
    //server output, type: 
    get display() {return this._display}
    set display(v) {this._display = v}
    //server output, type: 
    get startTime() {return this._startTime}
    set startTime(v) {this._startTime = v}
    //server output, type: Partener//组队者信息,非组队模式下传空
    get partener() {return this._partener}
    set partener(v) {this._partener = v}
    static Init(ctx, checkLogin = false) {
        let o = new TourIndexInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class CancelParten extends Base {
    constructor() {
        super();
        this.action = 'tour.cancelparten';
    
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = [];
    }
    static Init(ctx, checkLogin = false) {
        let o = new CancelParten();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class LookTicket extends Base {
    constructor() {
        super();
        this.action = 'player.lookticket';
    
        this._ticket = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["ticket"];
    }
    //server output, type: TicketInfo[]
    get ticket() {return this._ticket}
    set ticket(v) {this._ticket = v}
    static Init(ctx, checkLogin = false) {
        let o = new LookTicket();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class Photography extends Base {
    constructor() {
        super();
        this.action = 'tour.photography';
    
        this._cid = null;
        this._spotId = null;
        this._postcard = null;
        this._freePhoto = null;
        this.requireFileds = ["cid","spotId"];
        this.reqFields = ["cid","spotId"];
        this.resFields = ["postcard","freePhoto"];
    }
    //client input, require, type: number
    get cid() {return this._cid}
    set cid(v) {this._cid = v}
    //client input, require, type: number
    get spotId() {return this._spotId}
    set spotId(v) {this._spotId = v}
    //server output, type: Postcard
    get postcard() {return this._postcard}
    set postcard(v) {this._postcard = v}
    //server output, type: number
    get freePhoto() {return this._freePhoto}
    set freePhoto(v) {this._freePhoto = v}
    static Init(ctx, checkLogin = false) {
        let o = new Photography();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class SignInfo extends Base {
    constructor() {
        super();
        this.action = 'player.signinfo';
    
        this._theDay = null;
        this._hasSign = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["theDay","hasSign"];
    }
    //server output, type: number
    get theDay() {return this._theDay}
    set theDay(v) {this._theDay = v}
    //server output, type: number
    get hasSign() {return this._hasSign}
    set hasSign(v) {this._hasSign = v}
    static Init(ctx, checkLogin = false) {
        let o = new SignInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class ToSign extends Base {
    constructor() {
        super();
        this.action = 'player.tosign';
    
        this._theDay = null;
        this.requireFileds = [];
        this.reqFields = ["theDay"];
        this.resFields = [];
    }
    //client input, optional, type: number
    get theDay() {return this._theDay}
    set theDay(v) {this._theDay = v}
    static Init(ctx, checkLogin = false) {
        let o = new ToSign();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class ReqEnterspot extends Base {
    constructor() {
        super();
        this.action = 'tour.reqenterspot';
    
        this._spotId = null;
        this._cid = null;
        this._spot = null;
        this._events = null;
        this._goldNum = null;
        this.requireFileds = ["spotId","cid"];
        this.reqFields = ["spotId","cid"];
        this.resFields = ["spot","events","goldNum"];
    }
    //client input, require, type: number
    get spotId() {return this._spotId}
    set spotId(v) {this._spotId = v}
    //client input, require, type: number
    get cid() {return this._cid}
    set cid(v) {this._cid = v}
    //server output, type: EnterSpot
    get spot() {return this._spot}
    set spot(v) {this._spot = v}
    //server output, type: string[]
    get events() {return this._events}
    set events(v) {this._events = v}
    //server output, type: number//剩余金币数
    get goldNum() {return this._goldNum}
    set goldNum(v) {this._goldNum = v}
    static Init(ctx, checkLogin = false) {
        let o = new ReqEnterspot();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class SpotTour extends Base {
    constructor() {
        super();
        this.action = 'tour.spottour';
    
        this._cid = null;
        this._spotId = null;
        this._event = null;
        this._freeSight = null;
        this._goldNum = null;
        this.requireFileds = ["cid","spotId"];
        this.reqFields = ["cid","spotId"];
        this.resFields = ["event","freeSight","goldNum"];
    }
    //client input, require, type: number
    get cid() {return this._cid}
    set cid(v) {this._cid = v}
    //client input, require, type: number
    get spotId() {return this._spotId}
    set spotId(v) {this._spotId = v}
    //server output, type: string//产生的新事件
    get event() {return this._event}
    set event(v) {this._event = v}
    //server output, type: number
    get freeSight() {return this._freeSight}
    set freeSight(v) {this._freeSight = v}
    //server output, type: number//剩余金币数
    get goldNum() {return this._goldNum}
    set goldNum(v) {this._goldNum = v}
    static Init(ctx, checkLogin = false) {
        let o = new SpotTour();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class AnswerQuest extends Base {
    constructor() {
        super();
        this.action = 'tour.answerquest';
    
        this._id = null;
        this._answer = null;
        this._correct = null;
        this._userInfo = null;
        this._rewards = null;
        this.requireFileds = ["id","answer"];
        this.reqFields = ["id","answer"];
        this.resFields = ["correct","userInfo","rewards"];
    }
    //client input, require, type: number
    get id() {return this._id}
    set id(v) {this._id = v}
    //client input, require, type: string
    get answer() {return this._answer}
    set answer(v) {this._answer = v}
    //server output, type: boolean
    get correct() {return this._correct}
    set correct(v) {this._correct = v}
    //server output, type: UserInfo
    get userInfo() {return this._userInfo}
    set userInfo(v) {this._userInfo = v}
    //server output, type: KV[]
    get rewards() {return this._rewards}
    set rewards(v) {this._rewards = v}
    static Init(ctx, checkLogin = false) {
        let o = new AnswerQuest();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class EventShow extends Base {
    constructor() {
        super();
        this.action = 'tour.eventshow';
    
        this._cid = null;
        this._total = null;
        this._current = null;
        this._quest = null;
        this._userInfo = null;
        this.requireFileds = ["cid"];
        this.reqFields = ["cid"];
        this.resFields = ["total","current","quest","userInfo"];
    }
    //client input, require, type: number
    get cid() {return this._cid}
    set cid(v) {this._cid = v}
    //server output, type: number
    get total() {return this._total}
    set total(v) {this._total = v}
    //server output, type: number
    get current() {return this._current}
    set current(v) {this._current = v}
    //server output, type: Quest
    get quest() {return this._quest}
    set quest(v) {this._quest = v}
    //server output, type: 
    get userInfo() {return this._userInfo}
    set userInfo(v) {this._userInfo = v}
    static Init(ctx, checkLogin = false) {
        let o = new EventShow();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class ShowQuestReport extends Base {
    constructor() {
        super();
        this.action = 'tour.showquestreport';
    
        this._questReport = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["questReport"];
    }
    //server output, type: QuestReport
    get questReport() {return this._questReport}
    set questReport(v) {this._questReport = v}
    static Init(ctx, checkLogin = false) {
        let o = new ShowQuestReport();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class LeaveTour extends Base {
    constructor() {
        super();
        this.action = 'tour.leavetour';
    
        this._userinfo = null;
        this._cityPer = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["userinfo","cityPer"];
    }
    //server output, type: UserInfo
    get userinfo() {return this._userinfo}
    set userinfo(v) {this._userinfo = v}
    //server output, type: CityPer
    get cityPer() {return this._cityPer}
    set cityPer(v) {this._cityPer = v}
    static Init(ctx, checkLogin = false) {
        let o = new LeaveTour();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class RentProp extends Base {
    constructor() {
        super();
        this.action = 'tour.rentprop';
    
        this._rentId = null;
        this.requireFileds = ["rentId"];
        this.reqFields = ["rentId"];
        this.resFields = [];
    }
    //client input, require, type: number
    get rentId() {return this._rentId}
    set rentId(v) {this._rentId = v}
    static Init(ctx, checkLogin = false) {
        let o = new RentProp();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class RentedProp extends Base {
    constructor() {
        super();
        this.action = 'tour.rentedprop';
    
        this._rentItems = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["rentItems"];
    }
    //server output, type: KV[]//已租用的所有道具。
    get rentItems() {return this._rentItems}
    set rentItems(v) {this._rentItems = v}
    static Init(ctx, checkLogin = false) {
        let o = new RentedProp();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class BuyPostcardList extends Base {
    constructor() {
        super();
        this.action = 'tour.buypostcardlist';
    
        this._cid = null;
        this._ptList = null;
        this.requireFileds = ["cid"];
        this.reqFields = ["cid"];
        this.resFields = ["ptList"];
    }
    //client input, require, type: number
    get cid() {return this._cid}
    set cid(v) {this._cid = v}
    //server output, type: Postcard[]
    get ptList() {return this._ptList}
    set ptList(v) {this._ptList = v}
    static Init(ctx, checkLogin = false) {
        let o = new BuyPostcardList();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class Minapppay extends Base {
    constructor() {
        super();
        this.action = 'weChat.minapppay';
    
        this._goodsId = null;
        this._payCount = null;
        this._payload = null;
        this.requireFileds = ["goodsId","payCount"];
        this.reqFields = ["goodsId","payCount"];
        this.resFields = ["payload"];
    }
    //client input, require, type: number
    get goodsId() {return this._goodsId}
    set goodsId(v) {this._goodsId = v}
    //client input, require, type: number
    get payCount() {return this._payCount}
    set payCount(v) {this._payCount = v}
    //server output, type: Payload
    get payload() {return this._payload}
    set payload(v) {this._payload = v}
    static Init(ctx, checkLogin = false) {
        let o = new Minapppay();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class SetRouter extends Base {
    constructor() {
        super();
        this.action = 'tour.setrouter';
    
        this._cid = null;
        this._line = null;
        this._spots = null;
        this._startTime = null;
        this.requireFileds = ["cid","line"];
        this.reqFields = ["cid","line"];
        this.resFields = ["spots","startTime"];
    }
    //client input, require, type: string
    get cid() {return this._cid}
    set cid(v) {this._cid = v}
    //client input, require, type: array//景点id数组,每次传的都市完整的路线（包含已走过的）
    get line() {return this._line}
    set line(v) {this._line = v}
    //server output, type: RouterSpot[]//不包括起点
    get spots() {return this._spots}
    set spots(v) {this._spots = v}
    //server output, type: 
    get startTime() {return this._startTime}
    set startTime(v) {this._startTime = v}
    static Init(ctx, checkLogin = false) {
        let o = new SetRouter();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class ModifyRouter extends Base {
    constructor() {
        super();
        this.action = 'tour.modifyrouter';
    
        this._spots = null;
        this._goldNum = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["spots","goldNum"];
    }
    //server output, type: RouterSpot[]//不包括起点
    get spots() {return this._spots}
    set spots(v) {this._spots = v}
    //server output, type: number
    get goldNum() {return this._goldNum}
    set goldNum(v) {this._goldNum = v}
    static Init(ctx, checkLogin = false) {
        let o = new ModifyRouter();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class FreshSpots extends Base {
    constructor() {
        super();
        this.action = 'tour.freshspots';
    
        this._spots = null;
        this._display = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["spots","display"];
    }
    //server output, type: RouterSpot[]
    get spots() {return this._spots}
    set spots(v) {this._spots = v}
    //server output, type: 
    get display() {return this._display}
    set display(v) {this._display = v}
    static Init(ctx, checkLogin = false) {
        let o = new FreshSpots();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class PlayLoop extends Base {
    constructor() {
        super();
        this.action = 'tour.playloop';
    
        this._newEvent = null;
        this._freshSpots = null;
        this._spotsTracked = null;
        this._spotsAllTraced = null;
        this._spotsPlaned = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["newEvent","freshSpots","spotsTracked","spotsAllTraced","spotsPlaned"];
    }
    //server output, type: boolean
    get newEvent() {return this._newEvent}
    set newEvent(v) {this._newEvent = v}
    //server output, type: boolean
    get freshSpots() {return this._freshSpots}
    set freshSpots(v) {this._freshSpots = v}
    //server output, type: number//有几个到达了
    get spotsTracked() {return this._spotsTracked}
    set spotsTracked(v) {this._spotsTracked = v}
    //server output, type: boolean//是否已经把地图上所有的景点都走过了
    get spotsAllTraced() {return this._spotsAllTraced}
    set spotsAllTraced(v) {this._spotsAllTraced = v}
    //server output, type: boolean//路线是否已经规划完成，双人模式下，被邀请方规划路线完成后，通过此标记通知邀请方
    get spotsPlaned() {return this._spotsPlaned}
    set spotsPlaned(v) {this._spotsPlaned = v}
    static Init(ctx, checkLogin = false) {
        let o = new PlayLoop();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class FlyInfo extends Base {
    constructor() {
        super();
        this.action = 'startGame.flyinfo';
    
        this._type = null;
        this._gold = null;
        this._isSingleFirst = null;
        this._isDoubleFirst = null;
        this._season = null;
        this._weather = null;
        this._cost = null;
        this._doubleCost = null;
        this._location = null;
        this._holiday = null;
        this._cid = null;
        this.requireFileds = ["type"];
        this.reqFields = ["type"];
        this.resFields = ["gold","isSingleFirst","isDoubleFirst","season","weather","cost","doubleCost","location","holiday","cid"];
    }
    //client input, require, type: TicketType
    get type() {return this._type}
    set type(v) {this._type = v}
    //server output, type: number
    get gold() {return this._gold}
    set gold(v) {this._gold = v}
    //server output, type: Boolean
    get isSingleFirst() {return this._isSingleFirst}
    set isSingleFirst(v) {this._isSingleFirst = v}
    //server output, type: Boolean
    get isDoubleFirst() {return this._isDoubleFirst}
    set isDoubleFirst(v) {this._isDoubleFirst = v}
    //server output, type: Season
    get season() {return this._season}
    set season(v) {this._season = v}
    //server output, type: number
    get weather() {return this._weather}
    set weather(v) {this._weather = v}
    //server output, type: number
    get cost() {return this._cost}
    set cost(v) {this._cost = v}
    //server output, type: number
    get doubleCost() {return this._doubleCost}
    set doubleCost(v) {this._doubleCost = v}
    //server output, type: string
    get location() {return this._location}
    set location(v) {this._location = v}
    //server output, type: string
    get holiday() {return this._holiday}
    set holiday(v) {this._holiday = v}
    //server output, type: string
    get cid() {return this._cid}
    set cid(v) {this._cid = v}
    static Init(ctx, checkLogin = false) {
        let o = new FlyInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class StartGame extends Base {
    constructor() {
        super();
        this.action = 'startGame.startgame';
    
        this._type = null;
        this._cid = null;
        this._cost = null;
        this._inviteCode = null;
        this._tid = null;
        this._score = null;
        this._reward = null;
        this.requireFileds = ["type","cid","cost"];
        this.reqFields = ["type","cid","cost","inviteCode","tid"];
        this.resFields = ["score","reward"];
    }
    //client input, require, type: TicketType
    get type() {return this._type}
    set type(v) {this._type = v}
    //client input, require, type: number
    get cid() {return this._cid}
    set cid(v) {this._cid = v}
    //client input, require, type: number
    get cost() {return this._cost}
    set cost(v) {this._cost = v}
    //client input, optional, type: string
    get inviteCode() {return this._inviteCode}
    set inviteCode(v) {this._inviteCode = v}
    //client input, optional, type: string
    get tid() {return this._tid}
    set tid(v) {this._tid = v}
    //server output, type: number
    get score() {return this._score}
    set score(v) {this._score = v}
    //server output, type: number
    get reward() {return this._reward}
    set reward(v) {this._reward = v}
    static Init(ctx, checkLogin = false) {
        let o = new StartGame();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class CreateCode extends Base {
    constructor() {
        super();
        this.action = 'startGame.createcode';
    
        this._inviteCode = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["inviteCode"];
    }
    //server output, type: string
    get inviteCode() {return this._inviteCode}
    set inviteCode(v) {this._inviteCode = v}
    static Init(ctx, checkLogin = false) {
        let o = new CreateCode();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class CheckCode extends Base {
    constructor() {
        super();
        this.action = 'startGame.checkcode';
    
        this._inviteCode = null;
        this.requireFileds = ["inviteCode"];
        this.reqFields = ["inviteCode"];
        this.resFields = [];
    }
    //client input, require, type: string
    get inviteCode() {return this._inviteCode}
    set inviteCode(v) {this._inviteCode = v}
    static Init(ctx, checkLogin = false) {
        let o = new CheckCode();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class DeleteCode extends Base {
    constructor() {
        super();
        this.action = 'startGame.deletecode';
    
        this._inviteCode = null;
        this.requireFileds = ["inviteCode"];
        this.reqFields = ["inviteCode"];
        this.resFields = [];
    }
    //client input, require, type: string
    get inviteCode() {return this._inviteCode}
    set inviteCode(v) {this._inviteCode = v}
    static Init(ctx, checkLogin = false) {
        let o = new DeleteCode();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class PartnerInfo extends Base {
    constructor() {
        super();
        this.action = 'startGame.partnerinfo';
    
        this._inviteCode = null;
        this._nickName = null;
        this._avatarUrl = null;
        this._gold = null;
        this._season = null;
        this._weather = null;
        this._cid = null;
        this._location = null;
        this._holiday = null;
        this._parLocation = null;
        this._isFly = null;
        this._score = null;
        this._reward = null;
        this.requireFileds = ["inviteCode"];
        this.reqFields = ["inviteCode"];
        this.resFields = ["nickName","avatarUrl","gold","season","weather","cid","location","holiday","parLocation","isFly","score","reward"];
    }
    //client input, require, type: string
    get inviteCode() {return this._inviteCode}
    set inviteCode(v) {this._inviteCode = v}
    //server output, type: string
    get nickName() {return this._nickName}
    set nickName(v) {this._nickName = v}
    //server output, type: string
    get avatarUrl() {return this._avatarUrl}
    set avatarUrl(v) {this._avatarUrl = v}
    //server output, type: number
    get gold() {return this._gold}
    set gold(v) {this._gold = v}
    //server output, type: Season
    get season() {return this._season}
    set season(v) {this._season = v}
    //server output, type: number
    get weather() {return this._weather}
    set weather(v) {this._weather = v}
    //server output, type: string
    get cid() {return this._cid}
    set cid(v) {this._cid = v}
    //server output, type: string
    get location() {return this._location}
    set location(v) {this._location = v}
    //server output, type: string
    get holiday() {return this._holiday}
    set holiday(v) {this._holiday = v}
    //server output, type: string
    get parLocation() {return this._parLocation}
    set parLocation(v) {this._parLocation = v}
    //server output, type: number
    get isFly() {return this._isFly}
    set isFly(v) {this._isFly = v}
    //server output, type: number
    get score() {return this._score}
    set score(v) {this._score = v}
    //server output, type: number
    get reward() {return this._reward}
    set reward(v) {this._reward = v}
    static Init(ctx, checkLogin = false) {
        let o = new PartnerInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class TravelFootprint extends Base {
    constructor() {
        super();
        this.action = 'player.travelfootprint';
    
        this._playerUid = null;
        this._userInfo = null;
        this._items = null;
        this._reachrovince = null;
        this._totalArrive = null;
        this._totalArrivePercent = null;
        this._travelPercent = null;
        this.requireFileds = [];
        this.reqFields = ["playerUid"];
        this.resFields = ["userInfo","items","reachrovince","totalArrive","totalArrivePercent","travelPercent"];
    }
    //client input, optional, type: string
    get playerUid() {return this._playerUid}
    set playerUid(v) {this._playerUid = v}
    //server output, type: UserBriefInfo
    get userInfo() {return this._userInfo}
    set userInfo(v) {this._userInfo = v}
    //server output, type: KV[]
    get items() {return this._items}
    set items(v) {this._items = v}
    //server output, type: number
    get reachrovince() {return this._reachrovince}
    set reachrovince(v) {this._reachrovince = v}
    //server output, type: number
    get totalArrive() {return this._totalArrive}
    set totalArrive(v) {this._totalArrive = v}
    //server output, type: number
    get totalArrivePercent() {return this._totalArrivePercent}
    set totalArrivePercent(v) {this._totalArrivePercent = v}
    //server output, type: number
    get travelPercent() {return this._travelPercent}
    set travelPercent(v) {this._travelPercent = v}
    static Init(ctx, checkLogin = false) {
        let o = new TravelFootprint();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class MySpe extends Speciality {
    constructor() {
        super();
    
        //prop type: number//特产卖出价格
        this.sellPrice = null;
    
        //prop type: number//我的某个特产的数量
        this.num = null;
    
        
        
        
    }
}
class CitySpes extends Base {
    constructor() {
        super();
        this.action = 'speciality.cityspes';
    
        this._cityId = null;
        this._specialtys = null;
        this.requireFileds = ["cityId"];
        this.reqFields = ["cityId"];
        this.resFields = ["specialtys"];
    }
    //client input, require, type: number//城市id
    get cityId() {return this._cityId}
    set cityId(v) {this._cityId = v}
    //server output, type: Speciality[]
    get specialtys() {return this._specialtys}
    set specialtys(v) {this._specialtys = v}
    static Init(ctx, checkLogin = false) {
        let o = new CitySpes();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class MySpes extends Base {
    constructor() {
        super();
        this.action = 'speciality.myspes';
    
        this._specialtys = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["specialtys"];
    }
    //server output, type: MySpe[]
    get specialtys() {return this._specialtys}
    set specialtys(v) {this._specialtys = v}
    static Init(ctx, checkLogin = false) {
        let o = new MySpes();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class Spe extends Base {
    constructor() {
        super();
        this.action = 'speciality.spe';
    
        this._propId = null;
        this._count = null;
        this.requireFileds = ["propId","count"];
        this.reqFields = ["propId","count"];
        this.resFields = [];
    }
    //client input, require, type: number//特产id
    get propId() {return this._propId}
    set propId(v) {this._propId = v}
    //client input, require, type: number//购买数量
    get count() {return this._count}
    set count(v) {this._count = v}
    static Init(ctx, checkLogin = false) {
        let o = new Spe();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class TraveledPlaces extends Base {
    constructor() {
        super();
        this.action = 'player.traveledplaces';
    
        this._playerUid = null;
        this._provinces = null;
        this._citys = null;
        this.requireFileds = [];
        this.reqFields = ["playerUid"];
        this.resFields = ["provinces","citys"];
    }
    //client input, optional, type: string//用户uid，不传则是自己的
    get playerUid() {return this._playerUid}
    set playerUid(v) {this._playerUid = v}
    //server output, type: string[]//点亮的省名数组,如[‘江苏’]
    get provinces() {return this._provinces}
    set provinces(v) {this._provinces = v}
    //server output, type: string[]//点亮的城市名数组，如[‘苏州’]
    get citys() {return this._citys}
    set citys(v) {this._citys = v}
    static Init(ctx, checkLogin = false) {
        let o = new TraveledPlaces();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class GetUserLocation extends Base {
    constructor() {
        super();
        this.action = 'integralShop.getuserlocation';
    
        this._nickName = null;
        this._tel = null;
        this._address = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["nickName","tel","address"];
    }
    //server output, type: string
    get nickName() {return this._nickName}
    set nickName(v) {this._nickName = v}
    //server output, type: string
    get tel() {return this._tel}
    set tel(v) {this._tel = v}
    //server output, type: string
    get address() {return this._address}
    set address(v) {this._address = v}
    static Init(ctx, checkLogin = false) {
        let o = new GetUserLocation();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class ShareInfo extends Base {
    constructor() {
        super();
        this.action = 'player.shareinfo';
    
        this._isFirst = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["isFirst"];
    }
    //server output, type: boolean
    get isFirst() {return this._isFirst}
    set isFirst(v) {this._isFirst = v}
    static Init(ctx, checkLogin = false) {
        let o = new ShareInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class ViewpointInfo extends Base {
    constructor() {
        super();
        this.action = 'sight.viewpointinfo';
    
        this._pointId = null;
        this._season = null;
        this._weather = null;
        this._img = null;
        this._name = null;
        this._desc = null;
        this.requireFileds = ["pointId"];
        this.reqFields = ["pointId"];
        this.resFields = ["season","weather","img","name","desc"];
    }
    //client input, require, type: string
    get pointId() {return this._pointId}
    set pointId(v) {this._pointId = v}
    //server output, type: Season
    get season() {return this._season}
    set season(v) {this._season = v}
    //server output, type: number
    get weather() {return this._weather}
    set weather(v) {this._weather = v}
    //server output, type: string//返回景点的图片地址
    get img() {return this._img}
    set img(v) {this._img = v}
    //server output, type: string//景点名称
    get name() {return this._name}
    set name(v) {this._name = v}
    //server output, type: string//景点介绍
    get desc() {return this._desc}
    set desc(v) {this._desc = v}
    static Init(ctx, checkLogin = false) {
        let o = new ViewpointInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class Photograph extends Base {
    constructor() {
        super();
        this.action = 'sight.photograph';
    
        this._pointId = null;
        this._postImg = null;
        this.requireFileds = ["pointId"];
        this.reqFields = ["pointId"];
        this.resFields = ["postImg"];
    }
    //client input, require, type: string//景点id
    get pointId() {return this._pointId}
    set pointId(v) {this._pointId = v}
    //server output, type: string
    get postImg() {return this._postImg}
    set postImg(v) {this._postImg = v}
    static Init(ctx, checkLogin = false) {
        let o = new Photograph();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class CityListPer extends Base {
    constructor() {
        super();
        this.action = 'city.citylistper';
    
        this._data = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["data"];
    }
    //server output, type: ProvencePer[]
    get data() {return this._data}
    set data(v) {this._data = v}
    static Init(ctx, checkLogin = false) {
        let o = new CityListPer();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class WsSend extends Base {
    constructor() {
        super();
    
        
        
        
    }
}
class RankInfo extends Base {
    constructor() {
        super();
        this.action = 'rank.rankinfo';
    
        this._rankType = null;
        this._rankSubtype = null;
        this._page = null;
        this._limit = null;
        this._selfRank = null;
        this._ranks = null;
        this.requireFileds = ["rankType","rankSubtype"];
        this.reqFields = ["rankType","rankSubtype","page","limit"];
        this.resFields = ["selfRank","ranks"];
    }
    //client input, require, type: RankType
    get rankType() {return this._rankType}
    set rankType(v) {this._rankType = v}
    //client input, require, type: RankSubtype
    get rankSubtype() {return this._rankSubtype}
    set rankSubtype(v) {this._rankSubtype = v}
    //client input, optional, type: number
    get page() {return this._page}
    set page(v) {this._page = v}
    //client input, optional, type: number
    get limit() {return this._limit}
    set limit(v) {this._limit = v}
    //server output, type: SelfRank
    get selfRank() {return this._selfRank}
    set selfRank(v) {this._selfRank = v}
    //server output, type: RankItem[]
    get ranks() {return this._ranks}
    set ranks(v) {this._ranks = v}
    static Init(ctx, checkLogin = false) {
        let o = new RankInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class WsReceive extends Base {
    constructor() {
        super();
    
        
        
        
    }
   submit() {
        let tmp ={};
        tmp.action=this.action;
        this.resFields.forEach(k => {
            tmp[k]=this[k]
        });
        this.ctx.socket.emit(this.action, {data: tmp, code: this.code});
    }
}
class UserInfo extends UserBriefInfo {
    constructor() {
        super();
    
        //prop type: string
        this.gender = null;
    
        //prop type: number
        this.totalArrive = null;
    
        //prop type: number
        this.overmatch = null;
    
        //prop type: string
        this.city = null;
    
        //prop type: string
        this.province = null;
    
        //prop type: string
        this.country = null;
    
        //prop type: Boolean
        this.online = null;
    
        //prop type: KV[]
        this.items = null;
    
        //prop type: string[]
        this.friends = null;
    
        //prop type: OtherUserInfo
        this.otherUserInfo = null;
    
        
        
        
    }
}
class IndexInfo extends Base {
    constructor() {
        super();
        this.action = 'travel.indexinfo';
    
        this._isFirst = null;
        this._season = null;
        this._weather = null;
        this._playerCnt = null;
        this._friends = null;
        this._unreadMsgCnt = null;
        this._location = null;
        this._gold = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["isFirst","season","weather","playerCnt","friends","unreadMsgCnt","location","gold"];
    }
    //server output, type: Boolean
    get isFirst() {return this._isFirst}
    set isFirst(v) {this._isFirst = v}
    //server output, type: Season
    get season() {return this._season}
    set season(v) {this._season = v}
    //server output, type: number
    get weather() {return this._weather}
    set weather(v) {this._weather = v}
    //server output, type: number
    get playerCnt() {return this._playerCnt}
    set playerCnt(v) {this._playerCnt = v}
    //server output, type: FriendInfo[]
    get friends() {return this._friends}
    set friends(v) {this._friends = v}
    //server output, type: number
    get unreadMsgCnt() {return this._unreadMsgCnt}
    set unreadMsgCnt(v) {this._unreadMsgCnt = v}
    //server output, type: number
    get location() {return this._location}
    set location(v) {this._location = v}
    //server output, type: number
    get gold() {return this._gold}
    set gold(v) {this._gold = v}
    static Init(ctx, checkLogin = false) {
        let o = new IndexInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class TravelLog extends Base {
    constructor() {
        super();
        this.action = 'travel.travellog';
    
        this._playerUid = null;
        this._page = null;
        this._length = null;
        this._allLogs = null;
        this.requireFileds = [];
        this.reqFields = ["playerUid","page","length"];
        this.resFields = ["allLogs"];
    }
    //client input, optional, type: string
    get playerUid() {return this._playerUid}
    set playerUid(v) {this._playerUid = v}
    //client input, optional, type: number
    get page() {return this._page}
    set page(v) {this._page = v}
    //client input, optional, type: number
    get length() {return this._length}
    set length(v) {this._length = v}
    //server output, type: Log[]
    get allLogs() {return this._allLogs}
    set allLogs(v) {this._allLogs = v}
    static Init(ctx, checkLogin = false) {
        let o = new TravelLog();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class DetailLiveMessage extends OneBriefMessage {
    constructor() {
        super();
    
        //prop type: boolean
        this.hasNext = null;
    
        //prop type: boolean
        this.hasUp = null;
    
        
        
        
    }
}
class MyPostcards extends Base {
    constructor() {
        super();
        this.action = 'postcard.mypostcards';
    
        this._playerUid = null;
        this._postcardInfo = null;
        this.requireFileds = [];
        this.reqFields = ["playerUid"];
        this.resFields = ["postcardInfo"];
    }
    //client input, optional, type: string
    get playerUid() {return this._playerUid}
    set playerUid(v) {this._playerUid = v}
    //server output, type: ProvincePostcardInfo[]
    get postcardInfo() {return this._postcardInfo}
    set postcardInfo(v) {this._postcardInfo = v}
    static Init(ctx, checkLogin = false) {
        let o = new MyPostcards();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class CityPostcards extends Base {
    constructor() {
        super();
        this.action = 'postcard.citypostcards';
    
        this._province = null;
        this._playerUid = null;
        this._LM = null;
        this._postcardInfo = null;
        this.requireFileds = ["province"];
        this.reqFields = ["playerUid","LM","province"];
        this.resFields = ["postcardInfo"];
    }
    //client input, require, type: string
    get province() {return this._province}
    set province(v) {this._province = v}
    //client input, optional, type: string
    get playerUid() {return this._playerUid}
    set playerUid(v) {this._playerUid = v}
    //client input, optional, type: number
    get LM() {return this._LM}
    set LM(v) {this._LM = v}
    //server output, type: CityPostcardInfo[]
    get postcardInfo() {return this._postcardInfo}
    set postcardInfo(v) {this._postcardInfo = v}
    static Init(ctx, checkLogin = false) {
        let o = new CityPostcards();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class DetailPostcard extends Base {
    constructor() {
        super();
        this.action = 'postcard.detailpostcard';
    
        this._id = null;
        this._page = null;
        this._messageLength = null;
        this._pattern = null;
        this._mainUrl = null;
        this._lastestMessage = null;
        this.requireFileds = ["id"];
        this.reqFields = ["id","page","messageLength"];
        this.resFields = ["pattern","mainUrl","lastestMessage"];
    }
    //client input, require, type: number
    get id() {return this._id}
    set id(v) {this._id = v}
    //client input, optional, type: number
    get page() {return this._page}
    set page(v) {this._page = v}
    //client input, optional, type: number
    get messageLength() {return this._messageLength}
    set messageLength(v) {this._messageLength = v}
    //server output, type: number
    get pattern() {return this._pattern}
    set pattern(v) {this._pattern = v}
    //server output, type: string
    get mainUrl() {return this._mainUrl}
    set mainUrl(v) {this._mainUrl = v}
    //server output, type: DetailLiveMessage[]
    get lastestMessage() {return this._lastestMessage}
    set lastestMessage(v) {this._lastestMessage = v}
    static Init(ctx, checkLogin = false) {
        let o = new DetailPostcard();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class SendPostcard extends Base {
    constructor() {
        super();
        this.action = 'postcard.sendpostcard';
    
        this._id = null;
        this._message = null;
        this.requireFileds = ["id","message"];
        this.reqFields = ["id","message"];
        this.resFields = [];
    }
    //client input, require, type: number
    get id() {return this._id}
    set id(v) {this._id = v}
    //client input, require, type: string
    get message() {return this._message}
    set message(v) {this._message = v}
    static Init(ctx, checkLogin = false) {
        let o = new SendPostcard();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class PlayerInfo extends Base {
    constructor() {
        super();
        this.action = 'player.playerinfo';
    
        this._playerUid = null;
        this._info = null;
        this.requireFileds = [];
        this.reqFields = ["playerUid"];
        this.resFields = ["info"];
    }
    //client input, optional, type: string
    get playerUid() {return this._playerUid}
    set playerUid(v) {this._playerUid = v}
    //server output, type: UserInfo
    get info() {return this._info}
    set info(v) {this._info = v}
    static Init(ctx, checkLogin = false) {
        let o = new PlayerInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class Spot extends RouterSpot {
    constructor() {
        super();
    
        //prop type: number
        this.cid = null;
    
        //prop type: number
        this.id = null;
    
        //prop type: number
        this.x = null;
    
        //prop type: number
        this.y = null;
    
        //prop type: string
        this.name = null;
    
        //prop type: string[]
        this.building = null;
    
        
        
        
    }
}
class PostList extends Base {
    constructor() {
        super();
        this.action = 'post.postlist';
    
        this._cityId = null;
        this._page = null;
        this._limit = null;
        this._type = null;
        this._posts = null;
        this.requireFileds = ["cityId","page","limit","type"];
        this.reqFields = ["cityId","page","limit","type"];
        this.resFields = ["posts"];
    }
    //client input, require, type: string//城市id
    get cityId() {return this._cityId}
    set cityId(v) {this._cityId = v}
    //client input, require, type: number//页码
    get page() {return this._page}
    set page(v) {this._page = v}
    //client input, require, type: number//本次拉取的条数
    get limit() {return this._limit}
    set limit(v) {this._limit = v}
    //client input, require, type: PostType//帖子类型：景点or特产
    get type() {return this._type}
    set type(v) {this._type = v}
    //server output, type: Post[]//服务器返回帖子列表
    get posts() {return this._posts}
    set posts(v) {this._posts = v}
    static Init(ctx, checkLogin = false) {
        let o = new PostList();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class CommentPost extends Base {
    constructor() {
        super();
        this.action = 'post.commentpost';
    
        this._cityId = null;
        this._postId = null;
        this._content = null;
        this._score = null;
        this._type = null;
        this._comments = null;
        this.requireFileds = ["cityId","postId","content","score","type"];
        this.reqFields = ["cityId","postId","content","score","type"];
        this.resFields = ["comments"];
    }
    //client input, require, type: string//城市id
    get cityId() {return this._cityId}
    set cityId(v) {this._cityId = v}
    //client input, require, type: string//景点或特产id
    get postId() {return this._postId}
    set postId(v) {this._postId = v}
    //client input, require, type: string//评论内容
    get content() {return this._content}
    set content(v) {this._content = v}
    //client input, require, type: number//评分
    get score() {return this._score}
    set score(v) {this._score = v}
    //client input, require, type: PostType//帖子类型：景点or特产
    get type() {return this._type}
    set type(v) {this._type = v}
    //server output, type: Comment//自己的的评论信息
    get comments() {return this._comments}
    set comments(v) {this._comments = v}
    static Init(ctx, checkLogin = false) {
        let o = new CommentPost();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class PostComments extends Base {
    constructor() {
        super();
        this.action = 'post.postcomments';
    
        this._cityId = null;
        this._postId = null;
        this._page = null;
        this._limit = null;
        this._type = null;
        this._content = null;
        this._name = null;
        this._img = null;
        this._comments = null;
        this.requireFileds = ["cityId","postId","page","limit","type"];
        this.reqFields = ["cityId","postId","page","limit","type"];
        this.resFields = ["content","name","img","comments"];
    }
    //client input, require, type: string//城市id
    get cityId() {return this._cityId}
    set cityId(v) {this._cityId = v}
    //client input, require, type: string//帖子id
    get postId() {return this._postId}
    set postId(v) {this._postId = v}
    //client input, require, type: number//页码
    get page() {return this._page}
    set page(v) {this._page = v}
    //client input, require, type: number//本次拉取的条数
    get limit() {return this._limit}
    set limit(v) {this._limit = v}
    //client input, require, type: PostType//帖子类型：景点or特产
    get type() {return this._type}
    set type(v) {this._type = v}
    //server output, type: string//帖子内容，为景点或特产的介绍
    get content() {return this._content}
    set content(v) {this._content = v}
    //server output, type: 
    get name() {return this._name}
    set name(v) {this._name = v}
    //server output, type: string//景点或特产图片url
    get img() {return this._img}
    set img(v) {this._img = v}
    //server output, type: Comment[]//该帖子下的评论
    get comments() {return this._comments}
    set comments(v) {this._comments = v}
    static Init(ctx, checkLogin = false) {
        let o = new PostComments();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class ThumbComment extends Base {
    constructor() {
        super();
        this.action = 'post.thumbcomment';
    
        this._commentId = null;
        this._thumbs = null;
        this._haslike = null;
        this.requireFileds = ["commentId"];
        this.reqFields = ["commentId"];
        this.resFields = ["thumbs","haslike"];
    }
    //client input, require, type: string//评论id
    get commentId() {return this._commentId}
    set commentId(v) {this._commentId = v}
    //server output, type: number//点赞数
    get thumbs() {return this._thumbs}
    set thumbs(v) {this._thumbs = v}
    //server output, type: boolean//是否点赞
    get haslike() {return this._haslike}
    set haslike(v) {this._haslike = v}
    static Init(ctx, checkLogin = false) {
        let o = new ThumbComment();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class GetRealInfo extends Base {
    constructor() {
        super();
        this.action = 'player.getrealinfo';
    
        this._realInfo = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["realInfo"];
    }
    //server output, type: RealInfo
    get realInfo() {return this._realInfo}
    set realInfo(v) {this._realInfo = v}
    static Init(ctx, checkLogin = false) {
        let o = new GetRealInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class GetMessage extends Base {
    constructor() {
        super();
        this.action = 'message.getmessage';
    
        this._page = null;
        this._limit = null;
        this._messageType = null;
        this._messages = null;
        this.requireFileds = ["page","limit"];
        this.reqFields = ["page","limit","messageType"];
        this.resFields = ["messages"];
    }
    //client input, require, type: number
    get page() {return this._page}
    set page(v) {this._page = v}
    //client input, require, type: number
    get limit() {return this._limit}
    set limit(v) {this._limit = v}
    //client input, optional, type: MessageType
    get messageType() {return this._messageType}
    set messageType(v) {this._messageType = v}
    //server output, type: MessageItem[]
    get messages() {return this._messages}
    set messages(v) {this._messages = v}
    static Init(ctx, checkLogin = false) {
        let o = new GetMessage();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class CheckMsgCnt extends Base {
    constructor() {
        super();
        this.action = 'message.checkmsgcnt';
    
        this._unreadMsgCnt = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["unreadMsgCnt"];
    }
    //server output, type: number
    get unreadMsgCnt() {return this._unreadMsgCnt}
    set unreadMsgCnt(v) {this._unreadMsgCnt = v}
    static Init(ctx, checkLogin = false) {
        let o = new CheckMsgCnt();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class ClearMsg extends Base {
    constructor() {
        super();
        this.action = 'message.clearmsg';
    
        this._mid = null;
        this.requireFileds = ["mid"];
        this.reqFields = ["mid"];
        this.resFields = [];
    }
    //client input, require, type: string
    get mid() {return this._mid}
    set mid(v) {this._mid = v}
    static Init(ctx, checkLogin = false) {
        let o = new ClearMsg();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class ModifyRealInfo extends Base {
    constructor() {
        super();
        this.action = 'player.modifyrealinfo';
    
        this._name = null;
        this._birthday = null;
        this._phone = null;
        this._address = null;
        this._realInfo = null;
        this.requireFileds = ["name","birthday","phone","address"];
        this.reqFields = ["name","birthday","phone","address"];
        this.resFields = ["realInfo"];
    }
    //client input, require, type: string
    get name() {return this._name}
    set name(v) {this._name = v}
    //client input, require, type: string
    get birthday() {return this._birthday}
    set birthday(v) {this._birthday = v}
    //client input, require, type: string
    get phone() {return this._phone}
    set phone(v) {this._phone = v}
    //client input, require, type: string
    get address() {return this._address}
    set address(v) {this._address = v}
    //server output, type: RealInfo
    get realInfo() {return this._realInfo}
    set realInfo(v) {this._realInfo = v}
    static Init(ctx, checkLogin = false) {
        let o = new ModifyRealInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class CheckGuide extends Base {
    constructor() {
        super();
        this.action = 'tour.checkguide';
    
        this._hasPlay = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["hasPlay"];
    }
    //server output, type: boolean
    get hasPlay() {return this._hasPlay}
    set hasPlay(v) {this._hasPlay = v}
    static Init(ctx, checkLogin = false) {
        let o = new CheckGuide();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class IntegralShop extends Base {
    constructor() {
        super();
        this.action = 'integralShop.integralshop';
    
        this._integral = null;
        this._rank = null;
        this._shops = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["integral","rank","shops"];
    }
    //server output, type: number
    get integral() {return this._integral}
    set integral(v) {this._integral = v}
    //server output, type: number
    get rank() {return this._rank}
    set rank(v) {this._rank = v}
    //server output, type: Shop[]
    get shops() {return this._shops}
    set shops(v) {this._shops = v}
    static Init(ctx, checkLogin = false) {
        let o = new IntegralShop();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class ExchangeDetail extends Base {
    constructor() {
        super();
        this.action = 'integralShop.exchangedetail';
    
        this._page = null;
        this._exchangeDetail = null;
        this.requireFileds = ["page"];
        this.reqFields = ["page"];
        this.resFields = ["exchangeDetail"];
    }
    //client input, require, type: number
    get page() {return this._page}
    set page(v) {this._page = v}
    //server output, type: ExchangeShopDetail[]
    get exchangeDetail() {return this._exchangeDetail}
    set exchangeDetail(v) {this._exchangeDetail = v}
    static Init(ctx, checkLogin = false) {
        let o = new ExchangeDetail();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class ExchangeShop extends Base {
    constructor() {
        super();
        this.action = 'integralShop.exchangeshop';
    
        this._id = null;
        this._tel = null;
        this._addr = null;
        this.requireFileds = ["id","tel","addr"];
        this.reqFields = ["id","tel","addr"];
        this.resFields = [];
    }
    //client input, require, type: string
    get id() {return this._id}
    set id(v) {this._id = v}
    //client input, require, type: string
    get tel() {return this._tel}
    set tel(v) {this._tel = v}
    //client input, require, type: string
    get addr() {return this._addr}
    set addr(v) {this._addr = v}
    static Init(ctx, checkLogin = false) {
        let o = new ExchangeShop();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class BuyPostcard extends Base {
    constructor() {
        super();
        this.action = 'tour.buypostcard';
    
        this._ptid = null;
        this._goldNum = null;
        this.requireFileds = ["ptid"];
        this.reqFields = ["ptid"];
        this.resFields = ["goldNum"];
    }
    //client input, require, type: number
    get ptid() {return this._ptid}
    set ptid(v) {this._ptid = v}
    //server output, type: number
    get goldNum() {return this._goldNum}
    set goldNum(v) {this._goldNum = v}
    static Init(ctx, checkLogin = false) {
        let o = new BuyPostcard();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class SellSpe extends Spe {
    constructor() {
        super();
        this.action = 'speciality.sellspe';
    
        this._goldNum = null;
        this.requireFileds = ["propId","count"];
        this.reqFields = ["propId","count"];
        this.resFields = ["goldNum"];
    }
    //server output, type: number//返回剩余的金币数
    get goldNum() {return this._goldNum}
    set goldNum(v) {this._goldNum = v}
    static Init(ctx, checkLogin = false) {
        let o = new SellSpe();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class BuySpe extends Spe {
    constructor() {
        super();
        this.action = 'speciality.buyspe';
    
        this._goldNum = null;
        this.requireFileds = ["propId","count"];
        this.reqFields = ["propId","count"];
        this.resFields = ["goldNum"];
    }
    //server output, type: number//返回剩余的金币数
    get goldNum() {return this._goldNum}
    set goldNum(v) {this._goldNum = v}
    static Init(ctx, checkLogin = false) {
        let o = new BuySpe();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class SysMessage extends WsReceive {
    constructor() {
        super();
        this.action = 'sysmessage';
    
        this._mid = null;
        this._type = null;
        this._title = null;
        this._content = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["mid","type","title","content"];
    }
    //server output, type: number//消息Id
    get mid() {return this._mid}
    set mid(v) {this._mid = v}
    //server output, type: number//消息类型
    get type() {return this._type}
    set type(v) {this._type = v}
    //server output, type: string//消息标题
    get title() {return this._title}
    set title(v) {this._title = v}
    //server output, type: string//消息内容
    get content() {return this._content}
    set content(v) {this._content = v}
    static Init(ctx, checkLogin = false) {
        let o = new SysMessage();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
class TestSend extends WsSend {
    constructor() {
        super();
        this.action = 'testsend';
    
        this._test = null;
        this.requireFileds = ["test"];
        this.reqFields = ["test"];
        this.resFields = [];
    }
    //client input, require, type: string//测试字段
    get test() {return this._test}
    set test(v) {this._test = v}
    static Init(ctx, checkLogin = false) {
        let o = new TestSend();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        if (checkLogin) {
            return new Promise(resolve => {
                Base.checkLogin(o).then(()=>{resolve(o)});
            });
        }
        else {
            return o;
        }
    }
}
//-------------exports---------------
exports.Season = Season;
exports.PresentTktType = PresentTktType;
exports.Code = Code;
exports.RentItem = RentItem;
exports.SystemGift = SystemGift;
exports.TicketType = TicketType;
exports.RankType = RankType;
exports.RankSubtype = RankSubtype;
exports.PostType = PostType;
exports.MessageType = MessageType;
exports.Partener = Partener;
exports.Payload = Payload;
exports.OneDayLog = OneDayLog;
exports.OneCityLog = OneCityLog;
exports.Log = Log;
exports.FriendInfo = FriendInfo;
exports.ProvencePer = ProvencePer;
exports.CityPer = CityPer;
exports.UserBriefInfo = UserBriefInfo;
exports.OtherUserInfo = OtherUserInfo;
exports.RealInfo = RealInfo;
exports.TicketInfo = TicketInfo;
exports.Base = Base;
exports.Ws = Ws;
exports.Http = Http;
exports.QuestReport = QuestReport;
exports.RouterSpot = RouterSpot;
exports.TourTask = TourTask;
exports.oneSpot = oneSpot;
exports.Postcard = Postcard;
exports.Quest = Quest;
exports.EnterSpot = EnterSpot;
exports.Speciality = Speciality;
exports.Event = Event;
exports.Sight = Sight;
exports.RankItem = RankItem;
exports.SelfRank = SelfRank;
exports.ProvincePostcardInfo = ProvincePostcardInfo;
exports.CityPostcardInfo = CityPostcardInfo;
exports.PostcardBriefDetail = PostcardBriefDetail;
exports.OneBriefMessage = OneBriefMessage;
exports.Post = Post;
exports.Comment = Comment;
exports.MessageItem = MessageItem;
exports.ExchangeShopDetail = ExchangeShopDetail;
exports.Shop = Shop;
exports.FinishGuide = FinishGuide;
exports.TourIndexInfo = TourIndexInfo;
exports.CancelParten = CancelParten;
exports.LookTicket = LookTicket;
exports.Photography = Photography;
exports.SignInfo = SignInfo;
exports.ToSign = ToSign;
exports.ReqEnterspot = ReqEnterspot;
exports.SpotTour = SpotTour;
exports.AnswerQuest = AnswerQuest;
exports.EventShow = EventShow;
exports.ShowQuestReport = ShowQuestReport;
exports.LeaveTour = LeaveTour;
exports.RentProp = RentProp;
exports.RentedProp = RentedProp;
exports.BuyPostcardList = BuyPostcardList;
exports.Minapppay = Minapppay;
exports.SetRouter = SetRouter;
exports.ModifyRouter = ModifyRouter;
exports.FreshSpots = FreshSpots;
exports.PlayLoop = PlayLoop;
exports.FlyInfo = FlyInfo;
exports.StartGame = StartGame;
exports.CreateCode = CreateCode;
exports.CheckCode = CheckCode;
exports.DeleteCode = DeleteCode;
exports.PartnerInfo = PartnerInfo;
exports.TravelFootprint = TravelFootprint;
exports.MySpe = MySpe;
exports.CitySpes = CitySpes;
exports.MySpes = MySpes;
exports.Spe = Spe;
exports.TraveledPlaces = TraveledPlaces;
exports.GetUserLocation = GetUserLocation;
exports.ShareInfo = ShareInfo;
exports.ViewpointInfo = ViewpointInfo;
exports.Photograph = Photograph;
exports.CityListPer = CityListPer;
exports.WsSend = WsSend;
exports.RankInfo = RankInfo;
exports.WsReceive = WsReceive;
exports.UserInfo = UserInfo;
exports.IndexInfo = IndexInfo;
exports.TravelLog = TravelLog;
exports.DetailLiveMessage = DetailLiveMessage;
exports.MyPostcards = MyPostcards;
exports.CityPostcards = CityPostcards;
exports.DetailPostcard = DetailPostcard;
exports.SendPostcard = SendPostcard;
exports.PlayerInfo = PlayerInfo;
exports.Spot = Spot;
exports.PostList = PostList;
exports.CommentPost = CommentPost;
exports.PostComments = PostComments;
exports.ThumbComment = ThumbComment;
exports.GetRealInfo = GetRealInfo;
exports.GetMessage = GetMessage;
exports.CheckMsgCnt = CheckMsgCnt;
exports.ClearMsg = ClearMsg;
exports.ModifyRealInfo = ModifyRealInfo;
exports.CheckGuide = CheckGuide;
exports.IntegralShop = IntegralShop;
exports.ExchangeDetail = ExchangeDetail;
exports.ExchangeShop = ExchangeShop;
exports.BuyPostcard = BuyPostcard;
exports.SellSpe = SellSpe;
exports.BuySpe = BuySpe;
exports.SysMessage = SysMessage;
exports.TestSend = TestSend;
