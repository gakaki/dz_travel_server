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
class RealInfo  {
    constructor(){
    
        //prop type: string
        this.uid = null;
    
        //prop type: string
        this.name = null;
    
        //prop type: string
        this.birthday = null;
    
        //prop type: number
        this.phoneNumber = null;
    
        //prop type: string
        this.adress = null;
    
        
        
    }
}
class Sight  {
    constructor(){
    
        //prop type: number//城市id
        this.cityId = null;
    
        //prop type: string//返回明信片的图片地址
        this.img = null;
    
        
        
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
class Rent  {
    constructor(){
    
        //prop type: number//装备id(shop表)
        this.rentId = null;
    
        
        
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
class Log  {
    constructor(){
    
        //prop type: string
        this.year = null;
    
        //prop type: 
        this.cityLogs = null;
    
        
        
    }
}
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
class OneBriefMessage  {
    constructor(){
    
        //prop type: number
        this.id = null;
    
        //prop type: string
        this.time = null;
    
        //prop type: 
        this.friend = null;
    
        //prop type: string
        this.content = null;
    
        
        
    }
}
class DetailLiveMessage  {
    constructor(){
    
        //prop type: boolean
        this.hasNext = null;
    
        //prop type: boolean
        this.hasUp = null;
    
        
        
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
class exchangeShopDetail  {
    constructor(){
    
        //prop type: string
        this.nickname = null;
    
        //prop type: string
        this.shopName = null;
    
        
        
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
class Photograph extends Base {
    constructor(){
        super();
        this._img = null;
        this.reqFields = [];
        this.resFields = ["img"];
    }
    //server output, type: string
    get img() {return this._img}
    set img(v) {this._img = v}
    static Init(ctx) {
    let o = new Photograph();
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
    
        //prop type: KV[]
        this.rentItems = null;
    
        //prop type: string[]
        this.friends = null;
    
        //prop type: otherUserInfo
        this.otherUserInfo = null;
    
        
        
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
class ModifRealInfo extends Base {
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
    let o = new ModifRealInfo();
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
class IntegralShop extends Base {
    constructor(){
        super();
        this._integral = null;
        this._rank = null;
        this._exchangeDetail = null;
        this.reqFields = [];
        this.resFields = ["integral","rank","exchangeDetail"];
    }
    //server output, type: number
    get integral() {return this._integral}
    set integral(v) {this._integral = v}
    //server output, type: number
    get rank() {return this._rank}
    set rank(v) {this._rank = v}
    //server output, type: exchangeShopDetail[]
    get exchangeDetail() {return this._exchangeDetail}
    set exchangeDetail(v) {this._exchangeDetail = v}
    static Init(ctx) {
    let o = new IntegralShop();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
class exchangeShop extends Base {
    constructor(){
        super();
        this.reqFields = [];
        this.resFields = [];
    }
    static Init(ctx) {
    let o = new exchangeShop();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
    }
}
class getUserLocation extends Base {
    constructor(){
        super();
        this._nickname = null;
        this._tel = null;
        this._location = null;
        this.reqFields = [];
        this.resFields = ["nickname","tel","location"];
    }
    //server output, type: string
    get nickname() {return this._nickname}
    set nickname(v) {this._nickname = v}
    //server output, type: string
    get tel() {return this._tel}
    set tel(v) {this._tel = v}
    //server output, type: string
    get location() {return this._location}
    set location(v) {this._location = v}
    static Init(ctx) {
    let o = new getUserLocation();
    o.ctx = ctx;
    o.parse(ctx.query);
    return o;
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
exports.RankSubtype = RankSubtype;
exports.PostType = PostType;
exports.Specialty = Specialty;
exports.oneDayLog = oneDayLog;
exports.otherUserInfo = otherUserInfo;
exports.RealInfo = RealInfo;
exports.Sight = Sight;
exports.Base = Base;
exports.RankItem = RankItem;
exports.SelfRank = SelfRank;
exports.Provence = Provence;
exports.Rent = Rent;
exports.UserBriefInfo = UserBriefInfo;
exports.Log = Log;
exports.ProvincePostcardInfo = ProvincePostcardInfo;
exports.CityPostcardInfo = CityPostcardInfo;
exports.PostcardBriefDetail = PostcardBriefDetail;
exports.OneBriefMessage = OneBriefMessage;
exports.DetailLiveMessage = DetailLiveMessage;
exports.Post = Post;
exports.Comment = Comment;
exports.exchangeShopDetail = exchangeShopDetail;
exports.City = City;
exports.BuySpe = BuySpe;
exports.Photograph = Photograph;
exports.IndexInfo = IndexInfo;
exports.UserInfo = UserInfo;
exports.TravelLog = TravelLog;
exports.RankInfo = RankInfo;
exports.PlayerInfo = PlayerInfo;
exports.MyPostcards = MyPostcards;
exports.CityPostcards = CityPostcards;
exports.DetailPostcard = DetailPostcard;
exports.sendPostcard = sendPostcard;
exports.ModifRealInfo = ModifRealInfo;
exports.RentProp = RentProp;
exports.PostList = PostList;
exports.CommentPost = CommentPost;
exports.PostComments = PostComments;
exports.ThumbComment = ThumbComment;
exports.CityList = CityList;
exports.IntegralShop = IntegralShop;
exports.exchangeShop = exchangeShop;
exports.getUserLocation = getUserLocation;
exports.SpeList = SpeList;
exports.SellSpe = SellSpe;
exports.RechargeRankInfo = RechargeRankInfo;
