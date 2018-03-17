//-------------enums---------------
class Season{
    
    static get SPRING() { return '春';}
    
    static get SUMMER() { return '夏';}
    
    static get AUTUMN() { return '秋';}
    
    static get WINTER() { return '冬';}
    
}
class Weather{
    
    static get SUNNY() { return '晴';}
    
    static get CLOUDY() { return '阴';}
    
    static get RAIN() { return '雨';}
    
    static get SNOW() { return '雪';}
    
    static get WINDY() { return '风';}
    
}
class RankType{
    
    static get DAY() { return 1;}
    
    static get MONTH() { return 3;}
    
    static get RECHARGE() { return 9;}
    
}
//------------classes--------------
class UserInfo  {
    constructor(){
    
        //prop type: string
        this.uid = null;
    
        //prop type: string
        this.nickName = null;
    
        //prop type: string
        this.avatarUrl = null;
    
        //prop type: string
        this.gender = null;
    
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
    
        
        
    }
}
class RankItem  {
    constructor(){
    
        //prop type: string
        this.name = null;
    
        //prop type: number
        this.rank = null;
    
        
        
    }
}
class Base  {
    constructor(){
    
        //prop type: string
        this.action = null;
    
        //prop type: string
        this.uid = null;
    
        //prop type: string
        this._sid = null;
    
        //prop type: Context
        this.ctx = null;
    
        //prop type: string[]
        this.resFields = null;
    
        
        
    }
   submit() {
        let tmp ={};
        tmp.action=this.action;
        this.resFields.forEach(k => {
           tmp[k]=this[k]
        });

        this.ctx.body=tmp;
    }
   parse(data) {
        Object.assign(this, data);
    }
}
class IndexInfo extends Base {
    constructor(){
        super();
        this._isNew = null;
        this._season = null;
        this._weather = null;
        this._memberCnt = null;
        this._friends = null;
        this._unreadMsgCnt = null;
        this.reqFields = [];
        this.resFields = ["isNew","season","weather","memberCnt","friends","unreadMsgCnt"];
    }
    //server output, type: Boolean
    get isNew() {return this._isNew}
    set isNew(v) {this._isNew = v}
    //server output, type: Season
    get season() {return this._season}
    set season(v) {this._season = v}
    //server output, type: Weather
    get weather() {return this._weather}
    set weather(v) {this._weather = v}
    //server output, type: number
    get memberCnt() {return this._memberCnt}
    set memberCnt(v) {this._memberCnt = v}
    //server output, type: string[]
    get friends() {return this._friends}
    set friends(v) {this._friends = v}
    //server output, type: number
    get unreadMsgCnt() {return this._unreadMsgCnt}
    set unreadMsgCnt(v) {this._unreadMsgCnt = v}
    static Init(ctx) {
    let o = new IndexInfo();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
class PlayerInfo extends Base {
    constructor(){
        super();
        this._playerUid = null;
        this._info = null;
        this.reqFields = ["playerUid"];
        this.resFields = ["info"];
    }
    //client input, optional, type: string
    get playerUid() {return this._playerUid}
    set playerUid(v) {this._playerUid = v}
    //server output, type: UserInfo
    get info() {return this._info}
    set info(v) {this._info = v}
    static Init(ctx) {
    let o = new PlayerInfo();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
class RankInfo extends Base {
    constructor(){
        super();
        this._rankType = null;
        this._limit = null;
        this._selfRank = null;
        this._ranks = null;
        this.reqFields = ["rankType","limit"];
        this.resFields = ["selfRank","ranks"];
    }
    //client input, require, type: RankType
    get rankType() {return this._rankType}
    set rankType(v) {this._rankType = v}
    //client input, optional, type: number
    get limit() {return this._limit}
    set limit(v) {this._limit = v}
    //server output, type: number
    get selfRank() {return this._selfRank}
    set selfRank(v) {this._selfRank = v}
    //server output, type: RankItem[]
    get ranks() {return this._ranks}
    set ranks(v) {this._ranks = v}
    static Init(ctx) {
    let o = new RankInfo();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
class RechargeRankInfo extends RankInfo {
    constructor(){
        super();
        this._myRecharge = null;
        this.reqFields = ["rankType","limit"];
        this.resFields = ["myRecharge","selfRank","ranks"];
    }
    //server output, type: number
    get myRecharge() {return this._myRecharge}
    set myRecharge(v) {this._myRecharge = v}
    static Init(ctx) {
    let o = new RechargeRankInfo();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
//-------------exports---------------
exports.Season = Season;
exports.Weather = Weather;
exports.RankType = RankType;
exports.UserInfo = UserInfo;
exports.RankItem = RankItem;
exports.Base = Base;
exports.IndexInfo = IndexInfo;
exports.PlayerInfo = PlayerInfo;
exports.RankInfo = RankInfo;
exports.RechargeRankInfo = RechargeRankInfo;
