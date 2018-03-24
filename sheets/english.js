//所有原始数据


class Word {
    constructor(d) {
    this.cfg = d;
    }

    // id
    get id(){ return this.cfg.id; }

    // 英语
    get english(){ return this.cfg.english; }

    // 中文
    get China(){ return this.cfg.China; }

    // 音标
    get symbol(){ return this.cfg.symbol; }

    // 词类
    get speech(){ return this.cfg.speech; }

    // 难度
    get difficulty(){ return this.cfg.difficulty; }

    // 题目类型
    get type(){ return this.cfg.type; }

    // 抹去字母数
    get eliminateNum(){ return this.cfg.eliminateNum; }

    // 抹去字母位置
    get eliminate(){ return this.cfg.eliminate; }


    static Get(id){ return id in _data.word ? new Word(_data.word[id]) : null; }
}

class Stage {
    constructor(d) {
    this.cfg = d;
    }

    // id
    get id(){ return this.cfg.id; }

    // 升级所需
    get star(){ return this.cfg.star; }

    // 头像框
    get frame(){ return this.cfg.frame; }

    // 奖励
    get award(){ return this.cfg.award; }

    // 段位展示
    get show(){ return this.cfg.show; }

    // 对应难度
    get difficulty(){ return this.cfg.difficulty; }

    // 段位相应扣除金币
    get goldcoins1(){ return this.cfg.goldcoins1; }

    // 段位相应奖励金币
    get goldcoins2(){ return this.cfg.goldcoins2; }

    // 对应经验值
    get EXP(){ return this.cfg.EXP; }


    static Get(id){ return id in _data.stage ? new Stage(_data.stage[id]) : null; }
}

class Speech {
    constructor(d) {
    this.cfg = d;
    }

    // id
    get id(){ return this.cfg.id; }

    // 词类
    get speech(){ return this.cfg.speech; }

    // 最低等级
    get minlevel(){ return this.cfg.minlevel; }

    // 最高等级
    get endlevel(){ return this.cfg.endlevel; }

    // 每级加成
    get add(){ return this.cfg.add; }

    // 消耗道具
    get consume1(){ return this.cfg.consume1; }

    // 消耗道具递增
    get addconsume1(){ return this.cfg.addconsume1; }

    // 消耗金币
    get consume2(){ return this.cfg.consume2; }

    // 消耗金币递增
    get addconsume2(){ return this.cfg.addconsume2; }


    static Get(id){ return id in _data.speech ? new Speech(_data.speech[id]) : null; }
}

class Level {
    constructor(d) {
    this.cfg = d;
    }

    // id
    get id(){ return this.cfg.id; }

    // 等级
    get LV(){ return this.cfg.LV; }

    // 下一级
    get next(){ return this.cfg.next; }

    // 经验值
    get EXP(){ return this.cfg.EXP; }

    // 奖励
    get award(){ return this.cfg.award; }


    static Get(id){ return id in _data.level ? new Level(_data.level[id]) : null; }
}

class Item {
    constructor(d) {
    this.cfg = d;
    }

    // ID
    get id(){ return this.cfg.id; }

    // 是否可以使用
    get ifuse(){ return this.cfg.ifuse; }

    // 掉落
    get drop(){ return this.cfg.drop; }

    // 是否显示
    get ifshow(){ return this.cfg.ifshow; }


    static get GOLD() { return 1 };

    static get N() { return 2 };

    static get ADJ() { return 3 };

    static get ADV() { return 4 };

    static get PRON() { return 5 };

    static get NUM() { return 6 };

    static get V() { return 7 };

    static get ART() { return 8 };

    static get PREP() { return 9 };

    static get CONJ() { return 10 };

    static get INT() { return 11 };

    static get TREASURE1() { return 12 };

    static get TREASURE2() { return 13 };

    static get TREASURE3() { return 14 };

    static get COINS1() { return 15 };

    static get COINS2() { return 16 };

    static get COINS3() { return 17 };

    static Get(id){ return id in _data.item ? new Item(_data.item[id]) : null; }
}

class Drop {
    constructor(d) {
    this.cfg = d;
    }

    // ID
    get id(){ return this.cfg.id; }

    // 掉落描述
    get 自己看的(){ return this.cfg.自己看的; }

    // 掉落
    get randomdropID(){ return this.cfg.randomdropID; }


    static Get(id){ return id in _data.drop ? new Drop(_data.drop[id]) : null; }
}

class Randomdrop {
    constructor(d) {
    this.cfg = d;
    }

    // ID
    get id(){ return this.cfg.id; }

    // 掉落类型
    get droptype(){ return this.cfg.droptype; }

    // 掉落
    get drop(){ return this.cfg.drop; }


    static Get(id){ return id in _data.randomdrop ? new Randomdrop(_data.randomdrop[id]) : null; }
}

class Share {
    constructor(d) {
    this.cfg = d;
    }

    // id
    get id(){ return this.cfg.id; }

    // 图片
    get image(){ return this.cfg.image; }


    static get BATTLE() { return 1 };

    static get MAIN() { return 2 };

    static get RANK() { return 3 };

    static get HOMEPAGE() { return 4 };

    static get () { return 5 };

    static get () { return 6 };

    static get () { return 7 };

    static get () { return 8 };

    static Get(id){ return id in _data.share ? new Share(_data.share[id]) : null; }
}

class Landing {
    constructor(d) {
    this.cfg = d;
    }

    // ID
    get id(){ return this.cfg.id; }

    // 天数
    get day(){ return this.cfg.day; }

    // 掉落
    get itemid(){ return this.cfg.itemid; }

    // 显示
    get show(){ return this.cfg.show; }


    static Get(id){ return id in _data.landing ? new Landing(_data.landing[id]) : null; }
}

class Landingessay {
    constructor(d) {
    this.cfg = d;
    }

    // ID
    get id(){ return this.cfg.id; }

    // 天数
    get day(){ return this.cfg.day; }

    // 显示中文
    get Chinese(){ return this.cfg.Chinese; }

    // 显示英文
    get English(){ return this.cfg.English; }


    static Get(id){ return id in _data.landingessay ? new Landingessay(_data.landingessay[id]) : null; }
}

class Season {
    constructor(d) {
    this.cfg = d;
    }

    // ID
    get id(){ return this.cfg.id; }

    // 开始
    get star(){ return this.cfg.star; }

    // 结束
    get end(){ return this.cfg.end; }


    static Get(id){ return id in _data.season ? new Season(_data.season[id]) : null; }
}

class Shop {
    constructor(d) {
    this.cfg = d;
    }

    // id
    get id(){ return this.cfg.id; }

    // itemID
    get itemid(){ return this.cfg.itemid; }

    // 价格
    get Price(){ return this.cfg.Price; }


    static Get(id){ return id in _data.shop ? new Shop(_data.shop[id]) : null; }
}

class Tips {
    constructor(d) {
    this.cfg = d;
    }

    // id
    get id(){ return this.cfg.id; }

    // 提示标题
    get title(){ return this.cfg.title; }


    static Get(id){ return id in _data.tips ? new Tips(_data.tips[id]) : null; }
}

class Constant {
    constructor(d) {
    this.cfg = d;
    }

    // ID
    get id(){ return this.cfg.id; }

    // 数值
    get value(){ return this.cfg.value; }

    // 常量描述
    get constant(){ return this.cfg.constant; }


    static get EXP() { return 1 };

    static get SHARENUM() { return 2 };

    static get POSITION() { return 3 };

    static Get(id){ return id in _data.Constant ? new Constant(_data.Constant[id]) : null; }
}

class Comments {
    constructor(d) {
    this.cfg = d;
    }

    // id
    get id(){ return this.cfg.id; }

    // 新词汇数量
    get newterminology(){ return this.cfg.newterminology; }


    static Get(id){ return id in _data.Comments ? new Comments(_data.Comments[id]) : null; }
}


exports.words = Object.values(_data.word);
exports.stages = Object.values(_data.stage);
exports.speechs = Object.values(_data.speech);
exports.levels = Object.values(_data.level);
exports.items = Object.values(_data.item);
exports.drops = Object.values(_data.drop);
exports.randomdrops = Object.values(_data.randomdrop);
exports.shares = Object.values(_data.share);
exports.landings = Object.values(_data.landing);
exports.landingessays = Object.values(_data.landingessay);
exports.seasons = Object.values(_data.season);
exports.shops = Object.values(_data.shop);
exports.tipss = Object.values(_data.tips);
exports.Constants = Object.values(_data.Constant);
exports.Commentss = Object.values(_data.Comments);


exports.Word = Word;
exports.Stage = Stage;
exports.Speech = Speech;
exports.Level = Level;
exports.Item = Item;
exports.Drop = Drop;
exports.Randomdrop = Randomdrop;
exports.Share = Share;
exports.Landing = Landing;
exports.Landingessay = Landingessay;
exports.Season = Season;
exports.Shop = Shop;
exports.Tips = Tips;
exports.Constant = Constant;
exports.Comments = Comments;
