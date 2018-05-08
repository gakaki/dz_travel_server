const moment            = require("moment");
const travelsConfig     = require("../../../sheets/travel");
const util              = require("util");
const _                 = require("lodash");
const specialityRepo    = require("./specialityRepo");
const scenicspotRepo    = require("./scenicspotRepo");
const cityRepo          = require("./cityRepo");

//一个简单的树结构
class TreeNode {
    constructor(  data ) {
        this.parent     = null;
        this.children   = [];
        this.data       = data;
    }

    add( data ) {
        let childNode       = TreeNode( data );
        childNode.parent    = this;
        this.children.add(childNode);
        return childNode;
    }
}

//事件（或者叫任务）类 有前后置关系 所以做成树状
class Quest extends TreeNode {

    constructor(data) {
        super(data);
        this.RewardKey =  {
            "1" :"金币",
            "2" :"积分",
            "3" :"时间",
            "4" :"特产",
            "5" :"明信片"
        };

        let d               = this.data;

        this.trigger_type   = d.subtype;    //
        // this.loc_name       = d['loc_name']; //地点中文



        this.belong         = d.belong;     //事件归属
        //注意坑爹的belong 里居然同时包含了 cid和spotid2个数值 需要判断了
        this.dealCityAndSpotConfig();

        this.type           =  d.type;       //事件触发的景点或城市，通用事件填0

        this.EventTypeKeys =  { //事件触发类型
            COMMON:             "1",       // 1、普通事件
            QA_NO_NEED_RESULT:     "2",       // 2、剧情类答题事件（无需显示是否答对）
            QA_NEED_RESULT:  "3",       // 3、知识类答题事件（需要显示是否答对）
        };

        this.TriggerTypeKeys =  { //事件触发类型
            RANDOM_COMMON:      "1",       // 1、通用城市事件：在所有城市游玩都可以触发的事件；
            RANDOM_CITY:        "2",       // 2、特定城市事件：在特定城市游玩才能触发的事件；
            TOUR_COMMON:        "3",       // 3、通用观光checkGuide事件：在所有城市观光都可以触发的事件；
            TOUR_CITY:          "4",       // 4、特定观光事件：在特定城市观光才能触发的事件；
        };

        // 知识点 knowlege
        this.KnowledgeKeys     = {
            NORMAL:             "0",            //常规
            SPECIALITY:         "1",            //特产
            SCENICSPOT:         "2",            //景点
            CITY:               "3",            //地方归属
        };

        this.RewardType     = {
            GOLD:       "1", //金币
            POINT:      "2", //积分
            TIME:       "3", //时间追加 减少
            Speciality: "4", //特产
            POSTCARD:   "5", //明信片
        };

        this.id             = d.id;
        this.describe       = d.describe; //describe 字段是作为最后替换掉 s%的
        this.describeOringal =  d.describe; //事件描述 '以下特产中，哪个是s%的特产？',
        this.trigger_type   = d.subtype;    //事件触发类型
                                            // 1、通用城市事件：在所有城市游玩都可以触发的事件；
                                            // 2、特定城市事件：在特定城市游玩才能触发的事件；
                                            // 3、通用观光checkGuide事件：在所有城市观光都可以触发的事件；
                                            // 4、特定观光事件：在特定城市观光才能触发的事件；
        // this.loc_name       = d['loc_name']; //地点中文

     //   this.belong         =  d.belong;     //事件归属
      //  this.type           =  d.type;       //事件触发的景点或城市，通用事件填0
// 1、普通事件
// 2、剧情类答题事件（无需显示是否答对）
// 3、知识类答题事件（需要显示是否答对）

        this.topic          =  d.topic;
        // 知识点
        // 0:常规
        // 1：特产
        // 2：景点
        // 3：地方归属


        this.picture        =  d.picture;       //0表示没有图片
        this.reward         =  d.reward;        //事件奖励

        this.errorreward        =  d.errorreward;   //答题错误奖励0表示无奖励
        this.condition1_parent  =  d.condition1;    //前置事件
        // 0表示无前置事件
        // 前置事件如果是答题事件，需要答对才能继续往下进行。c
        // 0表示无前置事件
        // 前置事件如果是答题事件，需要答对才能继续往下进行。
        this.condition2_date     =  d.condition2;    //特定日期
        /*
            格式
            a/b/c
            a：1表示阳历；2表示阴历
            b:月份
            c:日期
            填0表示无日期限制
            a1/b1/c1:a2/b2/c2表示时间段
        */
        this.condition3_weather     =  d.condition3;    //特定天气      0：无天气限定1：晴天2：阴天3：雨天4：雪天
        this.condition4_     =  d.condition4;    //特定道具      0 无限制 1 不拥有医药箱
        this.probability    =  d.probability;   //触发权重      -1表示必定触发
        this.inform         =  d.inform;        //是否在界面推送
        this.answer         =  d.answer;        //正确答案
        this.wrong1         =  d.wrong1;        //错误答案1
        this.wrong2         =  d.wrong2;        //错误答案2
        this.wrong3         =  d.wrong3;        //错误答案3

        this.rewardKV        = {};
        for (let rewardRow of this.reward) {
            let typeId      = rewardRow['k'];
            let itemIdOrVal = rewardRow['v'];
            this.rewardKV[typeId] = itemIdOrVal;
        }

        this.errorewardKV        = {};
        for (let er of this.errorreward) {
            let typeId      = er['k'];
            let itemIdOrVal = er['v'];
            this.errorewardKV[typeId] = itemIdOrVal;
        }
    }

    dealCityAndSpotConfig() {
        this.configCity = null;
        this.cid = 0;
        this.configSpot = null;
        this.spotId = 0;
        if (this.belong > 0) {
            let configCity = travelsConfig.City.Get(this.belong);
            if (configCity) {
                this.configCity = configCity;
                this.cid = this.belong;
            }
            let configSpot = travelsConfig.Scenicspot.Get(this.belong);
            if (configSpot) {
                this.configSpot = configSpot;
                this.spotId = this.belong;
            }
        }
    }


    // 景点错误奖励语句
    getSpotErrorRewardComment(spotName,getReward){
        let reward   = getReward;

        let totalStr = `${this.describeOringal} `;
        let stmtArr  = [];

        if ( !reward ){              //若外部reward为空 那么设置为本类的reward
            reward   = this.errorreward;
        }
        for (let rewardRow of reward) {

            let typeId      = rewardRow['k'];
            let itemIdOrVal = rewardRow['v'];

            let typeName    = this.RewardKey[typeId];
            let itemCount   = 1;
            let itemName    = "";

            let str         = "";
            switch(typeId) {
                case "1": //金币
                    str = '金币';

                    if( itemIdOrVal < 0){
                        str         =str + `-`;
                    }else{
                        str             =str + `+`;
                    }

                    str             = str + `${Math.abs(itemIdOrVal)}`;
                    break;
                case "2": //积分
                    str = '积分';
                    str             = str + `+`;
                    str             = str + `${Math.abs(itemIdOrVal)}`;
                    break;
                case "3": //时间  据说观光的时间是没有的所以不管了
                    itemCount       = itemIdOrVal;
                    str             = `增加路程${typeName}${itemIdOrVal}分钟`;
                    break;
                case "4": //特产
                    itemCount       = itemIdOrVal;
                    let speciality  = travelsConfig.Speciality.Get(itemIdOrVal);
                    itemName        = speciality.specialityname;
                    str         = `${typeName}${itemName} +` + rewardRow['n'];
                    if(!rewardRow['n']) {
                        str = str + " 背包已满";
                    }
                    if ( !rewardRow['n'] ){
                        str         = `${typeName}${itemName}+1`;
                    }
                    break;
                case "5": //明信片  明信片随机所以无所谓了
                    str             = `明信片 +` + rewardRow['n'];
                    break;
            }
            stmtArr.unshift(str);
        }
        let index = totalStr.indexOf("s%");
        if(index != -1) {
            totalStr =totalStr.replace("s%", spotName);
        }
        return {
            desc: totalStr,
            reward: stmtArr.join(" ").trim(),
        };
    }
    // 景点奖励语句
    getSpotRewardComment(spotName,getReward){
        let reward   = getReward;

        let totalStr = `${this.describeOringal} `;
        let stmtArr  = [];

        if ( !reward ){              //若外部reward为空 那么设置为本类的reward
            reward   = this.reward;
        }
        for (let rewardRow of reward) {

                let typeId      = rewardRow['k'];
                let itemIdOrVal = rewardRow['v'];

                let typeName    = this.RewardKey[typeId];
                let itemCount   = 1;
                let itemName    = "";

                let str         = "";
                switch(typeId) {
                    case "1": //金币
                        str = '金币';

                       if( itemIdOrVal < 0){
                           str         =str + `-`;
                       }else{
                           str             =str + `+`;
                       }

                        str             = str + `${Math.abs(itemIdOrVal)}`;
                        break;
                    case "2": //积分
                        str = '积分';
                        str             = str + `+`;
                        str             = str + `${Math.abs(itemIdOrVal)}`;
                        break;
                    case "3": //时间  据说观光的时间是没有的所以不管了
                        itemCount       = itemIdOrVal;
                        str             = `增加路程${typeName}${itemIdOrVal}分钟`;
                        break;
                    case "4": //特产
                        itemCount       = itemIdOrVal;
                        let speciality  = travelsConfig.Speciality.Get(itemIdOrVal);
                        itemName        = speciality.specialityname;
                            str         = `${typeName}${itemName} +` + rewardRow['n'];
                            if(!rewardRow['n']) {
                                str = str + " 背包已满";
                            }
                        if ( !rewardRow['n'] ){
                            str         = `${typeName}${itemName}+1`;
                        }
                        break;
                    case "5": //明信片  明信片随机所以无所谓了
                        str             = `明信片 +` + rewardRow['n'];
                        break;
                }
                stmtArr.unshift(str);
        }
        let index = totalStr.indexOf("s%");
        if(index != -1) {
            totalStr =totalStr.replace("s%", spotName);
        }
        return {
            desc: totalStr,
            reward: stmtArr.join(" ").trim(),
        };
    }

    // 显示标准化语句
    getRewardNormal(){

        if( !this.reward ) return "";
        // 金币 +500
        // 明信片 +1，积分+5
        // 游玩时间 +100秒
        let obj         = {};
        for (let rewardRow of this.reward) {

            let typeId      = rewardRow['k'];
            let itemIdOrVal = rewardRow['v'];

            let typeName    = this.RewardKey[typeId];
            let itemCount   = 1;



            let str         = "";
            str             = `+`;
            if( itemIdOrVal < 0)
                str         = `-`;
            str             = str + `${Math.abs(itemIdOrVal)}`;
            obj[typeName]     = str;
            if ( typeId == this.RewardType.POSTCARD )
                obj[typeName] = "+1";
            if ( typeId == this.RewardType.Speciality )
                obj[typeName] = "+1";
        }
        let s = "";
        // 显示标准化：
        for(var k in obj){
            s += `${k}${obj[k]};`;
        }
        return s;
    }

}

module.exports =  Quest;

