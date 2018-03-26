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
//------------classes--------------
class ProvincePostcardInfo  {
    constructor(){
    
        //prop type: string
        this.logo = null;
    
        //prop type: string
        this.province = null;
    
        //prop type: number
        this.collectPostcardNum = null;
    
        //prop type: number
        this.allPostcardNum = null;
    
        
        
    }
}
class oneDayLog  {
    constructor(){
    
        //prop type: string
        this.time = null;
    
        //prop type: string
        this.city = null;
    
        //prop type: string[]
        this.scenicSpots = null;
    
        //prop type: number
        this.rentCarType = null;
    
        
        
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
class City  {
    constructor(){
    
        //prop type: 
        this.cityname = null;
    
        //prop type: 
        this.cityper = null;
    
        
        
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
class otherUserInfo  {
    constructor(){
    
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
    
        //prop type: numer
        this.specialty = null;
    
        
        
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
class RealInfo  {
    constructor(){
    
        //prop type: string
        this.uid = null;
    
        //prop type: string
        this.name = null;
    
        //prop type: string
        this.birthday = null;
    
        //prop type: string
        this.phoneNumber = null;
    
        //prop type: string
        this.adress = null;
    
        
        
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
class OneBriefMessage  {
    constructor(){
    
        //prop type: number
        this.id = null;
    
        //prop type: string
        this.time = null;
    
        //prop type: string
        this.nickname = null;
    
        //prop type: string
        this.content = null;
    
        
        
    }
}
class PostcardBriefDetail  {
    constructor(){
    
        //prop type: string
        this.id = null;
    
        //prop type: string
        this.url = null;
    
        //prop type: OneBriefMessage
        this.lastestLiveMessage = null;
    
        
        
    }
}
class RankItem  {
    constructor(){
    
        //prop type: number
        this.rank = null;
    
        //prop type: UserInfo
        this.userInfo = null;
    
        
        
    }
}
class SelfRank  {
    constructor(){
    
        //prop type: number
        this.rank = null;
    
        //prop type: UserInfo
        this.userInfo = null;
    
        
        
    }
}
class CityPostcardInfo  {
    constructor(){
    
        //prop type: string
        this.city = null;
    
        //prop type: boolean
        this.hasLiveMessage = null;
    
        //prop type: number
        this.collectPostcardNum = null;
    
        //prop type: number
        this.allPostcardNum = null;
    
        //prop type: PostcardBriefDetail[]
        this.postcardsDetail = null;
    
        
        
    }
}
class Log  {
    constructor(){
    
        //prop type: string
        this.year = null;
    
        //prop type: 
        this.cityLogs = null;
    
        
        
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
class cityList extends Base {
    constructor(){
        super();
        this._provence = null;
        this.reqFields = [];
        this.resFields = ["provence"];
    }
    //server output, type: Provence[]
    get provence() {return this._provence}
    set provence(v) {this._provence = v}
    static Init(ctx) {
    let o = new cityList();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
class ModifyRealInfo extends Base {
    constructor(){
        super();
        this._name = null;
        this._birthday = null;
        this._phone = null;
        this._adress = null;
        this._realInfo = null;
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
    static Init(ctx) {
    let o = new ModifyRealInfo();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
class GetRealInfo extends Base {
    constructor(){
        super();
        this._realInfo = null;
        this.reqFields = [];
        this.resFields = ["realInfo"];
    }
    //server output, type: RealInfo
    get realInfo() {return this._realInfo}
    set realInfo(v) {this._realInfo = v}
    static Init(ctx) {
    let o = new GetRealInfo();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
class MyPostcards extends Base {
    constructor(){
        super();
        this._ = null;
        this.reqFields = [];
        this.resFields = [""];
    }
    //server output, type: 
    get () {return this._}
    set (v) {this._ = v}
    static Init(ctx) {
    let o = new MyPostcards();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
class CityPostcards extends Base {
    constructor(){
        super();
        this._postcardInfo = null;
        this.reqFields = [];
        this.resFields = ["postcardInfo"];
    }
    //server output, type: CityPostcardInfo[]
    get postcardInfo() {return this._postcardInfo}
    set postcardInfo(v) {this._postcardInfo = v}
    static Init(ctx) {
    let o = new CityPostcards();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
class DetailPostcard extends Base {
    constructor(){
        super();
        this._url = null;
        this._lastestMessage = null;
        this.reqFields = [];
        this.resFields = ["url","lastestMessage"];
    }
    //server output, type: string
    get url() {return this._url}
    set url(v) {this._url = v}
    //server output, type: DetailLiveMessage[]
    get lastestMessage() {return this._lastestMessage}
    set lastestMessage(v) {this._lastestMessage = v}
    static Init(ctx) {
    let o = new DetailPostcard();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
class sendPostcard extends Base {
    constructor(){
        super();
        this.reqFields = [];
        this.resFields = [];
    }
    static Init(ctx) {
    let o = new sendPostcard();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
class RankInfo extends Base {
    constructor(){
        super();
        this._rankType = null;
        this._rankSubtype = null;
        this._limit = null;
        this._selfRank = null;
        this._ranks = null;
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
    
        //prop type: otherUserInfo
        this.otherUserInfo = null;
    
        
        
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
class TravelLog extends Base {
    constructor(){
        super();
        this._allLogs = null;
        this.reqFields = [];
        this.resFields = ["allLogs"];
    }
    //server output, type: Log[]
    get allLogs() {return this._allLogs}
    set allLogs(v) {this._allLogs = v}
    static Init(ctx) {
    let o = new TravelLog();
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
class RechargeRankInfo extends RankInfo {
    constructor(){
        super();
        this._myRecharge = null;
        this.reqFields = ["rankType","rankSubtype","limit"];
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
exports.RankSubtype = RankSubtype;
exports.PostType = PostType;
exports.ProvincePostcardInfo = ProvincePostcardInfo;
exports.oneDayLog = oneDayLog;
exports.Provence = Provence;
exports.City = City;
exports.UserBriefInfo = UserBriefInfo;
exports.otherUserInfo = otherUserInfo;
exports.Comment = Comment;
exports.RealInfo = RealInfo;
exports.Post = Post;
exports.OneBriefMessage = OneBriefMessage;
exports.PostcardBriefDetail = PostcardBriefDetail;
exports.RankItem = RankItem;
exports.SelfRank = SelfRank;
exports.CityPostcardInfo = CityPostcardInfo;
exports.Log = Log;
exports.Base = Base;
exports.PlayerInfo = PlayerInfo;
exports.cityList = cityList;
exports.ModifyRealInfo = ModifyRealInfo;
exports.GetRealInfo = GetRealInfo;
exports.MyPostcards = MyPostcards;
exports.CityPostcards = CityPostcards;
exports.DetailPostcard = DetailPostcard;
exports.sendPostcard = sendPostcard;
exports.RankInfo = RankInfo;
exports.UserInfo = UserInfo;
exports.PostList = PostList;
exports.CommentPost = CommentPost;
exports.PostComments = PostComments;
exports.ThumbComment = ThumbComment;
exports.TravelLog = TravelLog;
exports.IndexInfo = IndexInfo;
exports.RechargeRankInfo = RechargeRankInfo;
