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
class PostType{
    
    static get JINGDIAN() { return 1;}
    
    static get TECHAN() { return 2;}
    
}
//------------classes--------------
class RankItem  {
    constructor(){
    
        //prop type: string
        this.name = null;
    
        //prop type: number
        this.rank = null;
    
        //prop type: userInfo
        this.userInfo = null;
    
        
        
    }
}
class Provence  {
    constructor(){
    
        //prop type: 
        this.proLetter = null;
    
        //prop type: 
        this.provence = null;
    
        //prop type: 
        this.citys = null;
    
        
        
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
class Rent  {
    constructor(){
    
        //prop type: number//装备id(shop表)
        this.rentId = null;
    
        
        
    }
}
class Specialty  {
    constructor(){
    
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
class UserBriefInfo  {
    constructor(){
    
        //prop type: string
        this.uid = null;
    
        //prop type: string
        this.nickName = null;
    
        //prop type: string
        this.avatarUrl = null;
    
        
        
    }
}
class Post  {
    constructor(){
    
        //prop type: number//帖子id
        this.postId = null;
    
        //prop type: PostType//帖子类型：景点or特产
        this.type = null;
    
        //prop type: string//帖子内容，为景点或特产的介绍
        this.content = null;
    
        //prop type: 
        this.name = null;
    
        //prop type: number//帖子的评论
        this.score = null;
    
        //prop type: string//景点或特产图片url
        this.img = null;
    
        //prop type: number//评论数
        this.commentNum = null;
    
        
        
    }
}
class Comment  {
    constructor(){
    
        //prop type: number//帖子id
        this.postId = null;
    
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
    
        //prop type: number//创建时间
        this.time = null;
    
        
        
    }
}
class City  {
    constructor(){
    
        //prop type: 
        this.cityname = null;
    
        //prop type: 
        this.cityper = null;
    
        
        
    }
}
class SpeList extends Base {
    constructor(){
        super();
        this._specialtys = null;
        this.reqFields = [];
        this.resFields = ["specialtys"];
    }
    //server output, type: Specialty[]
    get specialtys() {return this._specialtys}
    set specialtys(v) {this._specialtys = v}
    static Init(ctx) {
    let o = new SpeList();
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
class UserInfo extends UserBriefInfo {
    constructor(){
        super();
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
    
        //prop type: KV[]
        this.rentItems = null;
    
        //prop type: string[]
        this.friends = null;
    
        
        
    }
}
class BuySpe extends Base {
    constructor(){
        super();
        this._items = null;
        this.reqFields = [];
        this.resFields = ["items"];
    }
    //server output, type: UserInfo.items
    get items() {return this._items}
    set items(v) {this._items = v}
    static Init(ctx) {
    let o = new BuySpe();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
class SellSpe extends Base {
    constructor(){
        super();
        this._specialtys = null;
        this.reqFields = [];
        this.resFields = ["specialtys"];
    }
    //server output, type: Specialty[]//金币增加数
    get specialtys() {return this._specialtys}
    set specialtys(v) {this._specialtys = v}
    static Init(ctx) {
    let o = new SellSpe();
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
class IndexInfo extends Base {
    constructor(){
        super();
        this._isFirst = null;
        this._season = null;
        this._weather = null;
        this._playerCnt = null;
        this._friends = null;
        this._unreadMsgCnt = null;
        this.reqFields = [];
        this.resFields = ["isFirst","season","weather","playerCnt","friends","unreadMsgCnt"];
    }
    //server output, type: Boolean
    get isFirst() {return this._isFirst}
    set isFirst(v) {this._isFirst = v}
    //server output, type: Season
    get season() {return this._season}
    set season(v) {this._season = v}
    //server output, type: Weather
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
    static Init(ctx) {
    let o = new IndexInfo();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
class PostList extends Base {
    constructor(){
        super();
        this._posts = null;
        this.reqFields = [];
        this.resFields = ["posts"];
    }
    //server output, type: Post[]//服务器返回帖子列表
    get posts() {return this._posts}
    set posts(v) {this._posts = v}
    static Init(ctx) {
    let o = new PostList();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
class CommentPost extends Base {
    constructor(){
        super();
        this.reqFields = [];
        this.resFields = [];
    }
    static Init(ctx) {
    let o = new CommentPost();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
class PostComments extends Base {
    constructor(){
        super();
        this._comments = null;
        this.reqFields = [];
        this.resFields = ["comments"];
    }
    //server output, type: Comment[]//该帖子下的评论
    get comments() {return this._comments}
    set comments(v) {this._comments = v}
    static Init(ctx) {
    let o = new PostComments();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
class ThumbComment extends Base {
    constructor(){
        super();
        this.reqFields = [];
        this.resFields = [];
    }
    static Init(ctx) {
    let o = new ThumbComment();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
class RentProp extends Base {
    constructor(){
        super();
        this._rentItems = null;
        this.reqFields = [];
        this.resFields = ["rentItems"];
    }
    //server output, type: UserInfo.rentItems
    get rentItems() {return this._rentItems}
    set rentItems(v) {this._rentItems = v}
    static Init(ctx) {
    let o = new RentProp();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
class CityList extends Base {
    constructor(){
        super();
        this._data = null;
        this.reqFields = [];
        this.resFields = ["data"];
    }
    //server output, type: Provence[]
    get data() {return this._data}
    set data(v) {this._data = v}
    static Init(ctx) {
    let o = new CityList();
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
exports.PostType = PostType;
exports.RankItem = RankItem;
exports.Provence = Provence;
exports.Base = Base;
exports.Rent = Rent;
exports.Specialty = Specialty;
exports.UserBriefInfo = UserBriefInfo;
exports.Post = Post;
exports.Comment = Comment;
exports.City = City;
exports.SpeList = SpeList;
exports.RankInfo = RankInfo;
exports.UserInfo = UserInfo;
exports.BuySpe = BuySpe;
exports.SellSpe = SellSpe;
exports.PlayerInfo = PlayerInfo;
exports.IndexInfo = IndexInfo;
exports.PostList = PostList;
exports.CommentPost = CommentPost;
exports.PostComments = PostComments;
exports.ThumbComment = ThumbComment;
exports.RentProp = RentProp;
exports.CityList = CityList;
exports.RechargeRankInfo = RechargeRankInfo;
