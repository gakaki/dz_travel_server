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
    
    static get GANG_FULLED() { return -112;}
    
    static get NEED_ITEMS() { return -113;}
    
    static get FRIEND_APPLY() { return -114;}
    
    static get FRIEND_DONE() { return -115;}
    
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
    
    static get NOT_FOUND() { return -10086;}
    
    static get NEED_COUPON() { return -170;}
    
    static get NEED_MONEY() { return -171;}
    
    static get NEED_INTEGRAL() { return -172;}
    
    static get NEED_ADDRESS() { return -173;}
    
    static get HAS_SIGNIN() { return -144;}
    
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
class Specialty {
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
    
        
        
        
    }
}
class oneSpot {
    constructor() {
    
    
        
        
        
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
    
    
        //prop type: 
        this.cityname = null;
    
        //prop type: 
        this.cityper = null;
    
        
        
        
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
class Shop {
    constructor() {
    
    
        //prop type: string
        this.id = null;
    
        //prop type: string
        this.url = null;
    
        //prop type: string
        this.name = null;
    
        //prop type: string
        this.integral = null;
    
        
        
        
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
    
        //prop type: PresentTktType
        this.type = null;
    
        
        
        
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
class Comment {
    constructor() {
    
    
        //prop type: string//帖子id
        this.postId = null;
    
        //prop type: string//景点或特产图片url
        this.img = null;
    
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
    
        //prop type: string//创建时间
        this.time = null;
    
        
        
        
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
    
        //prop type: number//帖子的评分
        this.score = null;
    
        //prop type: number//评论数
        this.commentNum = null;
    
        
        
        
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
class PostcardBriefDetail {
    constructor() {
    
    
        //prop type: string
        this.id = null;
    
        //prop type: string
        this.postid = null;
    
        //prop type: OneBriefMessage
        this.lastestLiveMessage = null;
    
        
        
        
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
class ProvincePostcardInfo {
    constructor() {
    
    
        //prop type: string
        this.postid = null;
    
        //prop type: string
        this.province = null;
    
        //prop type: number
        this.collectPostcardNum = null;
    
        //prop type: number
        this.allPostcardNum = null;
    
        
        
        
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
class SelfRank {
    constructor() {
    
    
        //prop type: number
        this.rank = null;
    
        //prop type: UserInfo
        this.userInfo = null;
    
        
        
        
    }
}
class RankItem {
    constructor() {
    
    
        //prop type: number
        this.rank = null;
    
        //prop type: UserInfo
        this.userInfo = null;
    
        
        
        
    }
}
class Ws {
    constructor() {
    
    
        
        
        
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
class DetailPostcard extends Base {
    constructor() {
        super();
        this.action = 'postcard.detailpostcard';
    
        this._id = null;
        this._page = null;
        this._messageLength = null;
        this._postid = null;
        this._lastestMessage = null;
        this.requireFileds = ["id"];
        this.reqFields = ["id","page","messageLength"];
        this.resFields = ["postid","lastestMessage"];
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
    //server output, type: string
    get postid() {return this._postid}
    set postid(v) {this._postid = v}
    //server output, type: DetailLiveMessage[]
    get lastestMessage() {return this._lastestMessage}
    set lastestMessage(v) {this._lastestMessage = v}
    static async Init(ctx, checkLogin = false) {
        let o = new DetailPostcard();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
    }
}
class StartGame extends Base {
    constructor() {
        super();
        this.action = 'startGame.startgame';
    
        this._type = null;
        this._cid = null;
        this._cost = null;
        this._partnerUid = null;
        this.requireFileds = ["type","cid","cost"];
        this.reqFields = ["type","cid","cost","partnerUid"];
        this.resFields = [];
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
    get partnerUid() {return this._partnerUid}
    set partnerUid(v) {this._partnerUid = v}
    static async Init(ctx, checkLogin = false) {
        let o = new StartGame();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
    }
}
class viewpointInfo extends Base {
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
    static async Init(ctx, checkLogin = false) {
        let o = new viewpointInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new Photograph();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
        this.ctx.io.emit(this.action, {data: tmp, code: this.code});
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
        this._limit = null;
        this._selfRank = null;
        this._ranks = null;
        this.requireFileds = ["rankType","rankSubtype"];
        this.reqFields = ["rankType","rankSubtype","limit"];
        this.resFields = ["selfRank","ranks"];
    }
    //client input, require, type: RankType
    get rankType() {return this._rankType}
    set rankType(v) {this._rankType = v}
    //client input, require, type: RankSubtype
    get rankSubtype() {return this._rankSubtype}
    set rankSubtype(v) {this._rankSubtype = v}
    //client input, optional, type: number
    get limit() {return this._limit}
    set limit(v) {this._limit = v}
    //server output, type: SelfRank
    get selfRank() {return this._selfRank}
    set selfRank(v) {this._selfRank = v}
    //server output, type: RankItem[]
    get ranks() {return this._ranks}
    set ranks(v) {this._ranks = v}
    static async Init(ctx, checkLogin = false) {
        let o = new RankInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    //server output, type: string[]
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
    static async Init(ctx, checkLogin = false) {
        let o = new IndexInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
    }
}
class RentProp extends Base {
    constructor() {
        super();
        this.action = 'prop.rentprop';
    
        this._rentId = null;
        this._rentItems = null;
        this.requireFileds = ["rentId"];
        this.reqFields = ["rentId"];
        this.resFields = ["rentItems"];
    }
    //client input, require, type: number
    get rentId() {return this._rentId}
    set rentId(v) {this._rentId = v}
    //server output, type: KV[]//已租用的所有道具。
    get rentItems() {return this._rentItems}
    set rentItems(v) {this._rentItems = v}
    static async Init(ctx, checkLogin = false) {
        let o = new RentProp();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new TraveledPlaces();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
    }
}
class mySpe extends Specialty {
    constructor() {
        super();
    
        //prop type: number//我的某个特产的数量
        this.num = null;
    
        
        
        
    }
}
class SpeList extends Base {
    constructor() {
        super();
        this.action = 'prop.spelist';
    
        this._cityId = null;
        this._specialtys = null;
        this.requireFileds = ["cityId"];
        this.reqFields = ["cityId"];
        this.resFields = ["specialtys"];
    }
    //client input, require, type: number//城市id
    get cityId() {return this._cityId}
    set cityId(v) {this._cityId = v}
    //server output, type: Specialty[]
    get specialtys() {return this._specialtys}
    set specialtys(v) {this._specialtys = v}
    static async Init(ctx, checkLogin = false) {
        let o = new SpeList();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
    }
}
class Spe extends Base {
    constructor() {
        super();
        this.action = 'prop.spe';
    
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
    static async Init(ctx, checkLogin = false) {
        let o = new Spe();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new TravelLog();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new GetUserLocation();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new TravelFootprint();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new ToSign();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new SignInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new LookTicket();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    
        this._postcardInfo = null;
        this.requireFileds = [];
        this.reqFields = [];
        this.resFields = ["postcardInfo"];
    }
    //server output, type: ProvincePostcardInfo[]
    get postcardInfo() {return this._postcardInfo}
    set postcardInfo(v) {this._postcardInfo = v}
    static async Init(ctx, checkLogin = false) {
        let o = new MyPostcards();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
    }
}
class CityPostcards extends Base {
    constructor() {
        super();
        this.action = 'postcard.citypostcards';
    
        this._province = null;
        this._LM = null;
        this._postcardInfo = null;
        this.requireFileds = ["province"];
        this.reqFields = ["LM","province"];
        this.resFields = ["postcardInfo"];
    }
    //client input, require, type: string
    get province() {return this._province}
    set province(v) {this._province = v}
    //client input, optional, type: number
    get LM() {return this._LM}
    set LM(v) {this._LM = v}
    //server output, type: CityPostcardInfo[]
    get postcardInfo() {return this._postcardInfo}
    set postcardInfo(v) {this._postcardInfo = v}
    static async Init(ctx, checkLogin = false) {
        let o = new CityPostcards();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new FlyInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new SendPostcard();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
    }
}
class ModifyRealInfo extends Base {
    constructor() {
        super();
        this.action = 'player.modifyrealinfo';
    
        this._name = null;
        this._birthday = null;
        this._phone = null;
        this._adress = null;
        this._realInfo = null;
        this.requireFileds = ["name","birthday","phone","adress"];
        this.reqFields = ["name","birthday","phone","adress"];
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
    get adress() {return this._adress}
    set adress(v) {this._adress = v}
    //server output, type: RealInfo
    get realInfo() {return this._realInfo}
    set realInfo(v) {this._realInfo = v}
    static async Init(ctx, checkLogin = false) {
        let o = new ModifyRealInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new GetRealInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new PostList();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
    }
}
class CommentPost extends Base {
    constructor() {
        super();
        this.action = 'post.commentpost';
    
        this._postId = null;
        this._content = null;
        this.requireFileds = ["postId","content"];
        this.reqFields = ["postId","content"];
        this.resFields = [];
    }
    //client input, require, type: string//景点或特产id
    get postId() {return this._postId}
    set postId(v) {this._postId = v}
    //client input, require, type: string//评论内容
    get content() {return this._content}
    set content(v) {this._content = v}
    static async Init(ctx, checkLogin = false) {
        let o = new CommentPost();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
    }
}
class PostComments extends Base {
    constructor() {
        super();
        this.action = 'post.postcomments';
    
        this._cityId = null;
        this._postId = null;
        this._lastCmtId = null;
        this._limit = null;
        this._comments = null;
        this.requireFileds = ["cityId","postId","lastCmtId","limit"];
        this.reqFields = ["cityId","postId","lastCmtId","limit"];
        this.resFields = ["comments"];
    }
    //client input, require, type: string//城市id
    get cityId() {return this._cityId}
    set cityId(v) {this._cityId = v}
    //client input, require, type: string//帖子id
    get postId() {return this._postId}
    set postId(v) {this._postId = v}
    //client input, require, type: number//上一屏最后comment的id
    get lastCmtId() {return this._lastCmtId}
    set lastCmtId(v) {this._lastCmtId = v}
    //client input, require, type: number//本次拉取的条数
    get limit() {return this._limit}
    set limit(v) {this._limit = v}
    //server output, type: Comment[]//该帖子下的评论
    get comments() {return this._comments}
    set comments(v) {this._comments = v}
    static async Init(ctx, checkLogin = false) {
        let o = new PostComments();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
    }
}
class ThumbComment extends Base {
    constructor() {
        super();
        this.action = 'post.thumbcomment';
    
        this._commentId = null;
        this.requireFileds = ["commentId"];
        this.reqFields = ["commentId"];
        this.resFields = [];
    }
    //client input, require, type: string//评论id
    get commentId() {return this._commentId}
    set commentId(v) {this._commentId = v}
    static async Init(ctx, checkLogin = false) {
        let o = new ThumbComment();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new PlayerInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new GetMessage();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new CheckMsgCnt();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new ClearMsg();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    
        //prop type: KV[]
        this.rentItems = null;
    
        //prop type: string[]
        this.friends = null;
    
        //prop type: OtherUserInfo
        this.otherUserInfo = null;
    
        
        
        
    }
}
class ExchangeShop extends Base {
    constructor() {
        super();
        this.action = 'integralShop.exchangeshop';
    
        this._id = null;
        this._addr = null;
        this.requireFileds = ["id","addr"];
        this.reqFields = ["id","addr"];
        this.resFields = [];
    }
    //client input, require, type: string
    get id() {return this._id}
    set id(v) {this._id = v}
    //client input, require, type: string
    get addr() {return this._addr}
    set addr(v) {this._addr = v}
    static async Init(ctx, checkLogin = false) {
        let o = new ExchangeShop();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new IntegralShop();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new ExchangeDetail();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new CityListPer();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new SysMessage();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
    }
}
class SellSpe extends Spe {
    constructor() {
        super();
        this.action = 'prop.sellspe';
    
        this._goldNum = null;
        this.requireFileds = ["propId","count"];
        this.reqFields = ["propId","count"];
        this.resFields = ["goldNum"];
    }
    //server output, type: number//返回剩余的金币数
    get goldNum() {return this._goldNum}
    set goldNum(v) {this._goldNum = v}
    static async Init(ctx, checkLogin = false) {
        let o = new SellSpe();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
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
    static async Init(ctx, checkLogin = false) {
        let o = new TestSend();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
    }
}
class BuySpe extends Spe {
    constructor() {
        super();
        this.action = 'prop.buyspe';
    
        this._items = null;
        this._goldNum = null;
        this.requireFileds = ["propId","count"];
        this.reqFields = ["propId","count"];
        this.resFields = ["items","goldNum"];
    }
    //server output, type: KV[]
    get items() {return this._items}
    set items(v) {this._items = v}
    //server output, type: number//返回剩余的金币数
    get goldNum() {return this._goldNum}
    set goldNum(v) {this._goldNum = v}
    static async Init(ctx, checkLogin = false) {
        let o = new BuySpe();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
    }
}
class RechargeRankInfo extends RankInfo {
    constructor() {
        super();
        this.action = 'rank.rechargerankinfo';
    
        this._myRecharge = null;
        this.requireFileds = ["rankType","rankSubtype"];
        this.reqFields = ["rankType","rankSubtype","limit"];
        this.resFields = ["myRecharge","selfRank","ranks"];
    }
    //server output, type: number
    get myRecharge() {return this._myRecharge}
    set myRecharge(v) {this._myRecharge = v}
    static async Init(ctx, checkLogin = false) {
        let o = new RechargeRankInfo();
        o.ctx = ctx;
        o.code = 0;
        o.parse(ctx.query, true);
        checkLogin && await Base.checkLogin(o);
        return o;
    }
}
//-------------exports---------------
exports.Season = Season;
exports.PresentTktType = PresentTktType;
exports.Code = Code;
exports.TicketType = TicketType;
exports.RankType = RankType;
exports.RankSubtype = RankSubtype;
exports.PostType = PostType;
exports.MessageType = MessageType;
exports.Specialty = Specialty;
exports.oneSpot = oneSpot;
exports.OneCityLog = OneCityLog;
exports.Log = Log;
exports.ProvencePer = ProvencePer;
exports.CityPer = CityPer;
exports.Event = Event;
exports.Shop = Shop;
exports.UserBriefInfo = UserBriefInfo;
exports.OtherUserInfo = OtherUserInfo;
exports.ExchangeShopDetail = ExchangeShopDetail;
exports.RealInfo = RealInfo;
exports.TicketInfo = TicketInfo;
exports.MessageItem = MessageItem;
exports.Comment = Comment;
exports.Post = Post;
exports.OneBriefMessage = OneBriefMessage;
exports.PostcardBriefDetail = PostcardBriefDetail;
exports.CityPostcardInfo = CityPostcardInfo;
exports.ProvincePostcardInfo = ProvincePostcardInfo;
exports.OneDayLog = OneDayLog;
exports.Base = Base;
exports.SelfRank = SelfRank;
exports.RankItem = RankItem;
exports.Ws = Ws;
exports.Sight = Sight;
exports.DetailPostcard = DetailPostcard;
exports.StartGame = StartGame;
exports.viewpointInfo = viewpointInfo;
exports.Photograph = Photograph;
exports.WsReceive = WsReceive;
exports.WsSend = WsSend;
exports.RankInfo = RankInfo;
exports.IndexInfo = IndexInfo;
exports.RentProp = RentProp;
exports.TraveledPlaces = TraveledPlaces;
exports.mySpe = mySpe;
exports.SpeList = SpeList;
exports.Spe = Spe;
exports.TravelLog = TravelLog;
exports.GetUserLocation = GetUserLocation;
exports.TravelFootprint = TravelFootprint;
exports.ToSign = ToSign;
exports.SignInfo = SignInfo;
exports.LookTicket = LookTicket;
exports.DetailLiveMessage = DetailLiveMessage;
exports.MyPostcards = MyPostcards;
exports.CityPostcards = CityPostcards;
exports.FlyInfo = FlyInfo;
exports.SendPostcard = SendPostcard;
exports.ModifyRealInfo = ModifyRealInfo;
exports.GetRealInfo = GetRealInfo;
exports.PostList = PostList;
exports.CommentPost = CommentPost;
exports.PostComments = PostComments;
exports.ThumbComment = ThumbComment;
exports.PlayerInfo = PlayerInfo;
exports.GetMessage = GetMessage;
exports.CheckMsgCnt = CheckMsgCnt;
exports.ClearMsg = ClearMsg;
exports.UserInfo = UserInfo;
exports.ExchangeShop = ExchangeShop;
exports.IntegralShop = IntegralShop;
exports.ExchangeDetail = ExchangeDetail;
exports.CityListPer = CityListPer;
exports.SysMessage = SysMessage;
exports.SellSpe = SellSpe;
exports.TestSend = TestSend;
exports.BuySpe = BuySpe;
exports.RechargeRankInfo = RechargeRankInfo;
