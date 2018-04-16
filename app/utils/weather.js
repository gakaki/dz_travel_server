const constant = require("./constant");

const utils = require("./utils");

const url = 'http://tj.nineton.cn/Heart/index/all?'//中央天气预报
const chinaUrl = 'http://www.weather.com.cn/data/sk/101010100.html'//中央天气预报
//城市编码表（处理过的,目前只支持国内城市，及国外的国/洲级地区，如需扩展到区，请使用源表重新处理），源表：https://raw.githubusercontent.com/jokermonn/-Api/master/CenterWeatherCityCode.json
const weatherCode = {
    "Beijing": {
        "cityName": "北京",
        "cityEN": "Beijing",
        "townID": "CHBJ000000",
        "townName": "北京",
        "townEN": "Beijing"
    },
    "北京": {"cityName": "北京", "cityEN": "Beijing", "townID": "CHBJ000000", "townName": "北京", "townEN": "Beijing"},
    "Shanghai": {
        "cityName": "上海",
        "cityEN": "Shanghai",
        "townID": "CHSH000000",
        "townName": "上海",
        "townEN": "Shanghai"
    },
    "上海": {"cityName": "上海", "cityEN": "Shanghai", "townID": "CHSH000000", "townName": "上海", "townEN": "Shanghai"},
    "Tianjin": {"cityName": "天津", "cityEN": "Tianjin", "townID": "CHTJ000000", "townName": "天津", "townEN": "Tianjin"},
    "天津": {"cityName": "天津", "cityEN": "Tianjin", "townID": "CHTJ000000", "townName": "天津", "townEN": "Tianjin"},
    "Chongqing": {
        "cityName": "重庆",
        "cityEN": "Chongqing",
        "townID": "CHCQ000000",
        "townName": "重庆",
        "townEN": "Chongqing"
    },
    "重庆": {"cityName": "重庆", "cityEN": "Chongqing", "townID": "CHCQ000000", "townName": "重庆", "townEN": "Chongqing"},
    "Hong Kong": {
        "cityName": "香港",
        "cityEN": "Hong Kong",
        "townID": "CHHK000000",
        "townName": "香港",
        "townEN": "Hong Kong"
    },
    "香港": {"cityName": "香港", "cityEN": "Hong Kong", "townID": "CHHK000000", "townName": "香港", "townEN": "Hong Kong"},
    "Macao": {"cityName": "澳门", "cityEN": "Macao", "townID": "CHMO000000", "townName": "澳门", "townEN": "Macao"},
    "澳门": {"cityName": "澳门", "cityEN": "Macao", "townID": "CHMO000000", "townName": "澳门", "townEN": "Macao"},
    "Taipei": {"cityName": "台北", "cityEN": "Taipei", "townID": "CHTW000000", "townName": "台北", "townEN": "Taipei"},
    "台北": {"cityName": "台北", "cityEN": "Taipei", "townID": "CHTW000000", "townName": "台北", "townEN": "Taipei"},
    "Gaoxiong": {
        "cityName": "高雄",
        "cityEN": "Gaoxiong",
        "townID": "CHTW010000",
        "townName": "高雄",
        "townEN": "Gaoxiong"
    },
    "高雄": {"cityName": "高雄", "cityEN": "Gaoxiong", "townID": "CHTW010000", "townName": "高雄", "townEN": "Gaoxiong"},
    "Taizhong": {
        "cityName": "台中",
        "cityEN": "Taizhong",
        "townID": "CHTW020000",
        "townName": "台中",
        "townEN": "Taizhong"
    },
    "台中": {"cityName": "台中", "cityEN": "Taizhong", "townID": "CHTW020000", "townName": "台中", "townEN": "Taizhong"},
    "Haerbin": {"cityName": "哈尔滨", "cityEN": "Haerbin", "townID": "CHHL000000", "townName": "哈尔滨", "townEN": "Haerbin"},
    "哈尔滨": {"cityName": "哈尔滨", "cityEN": "Haerbin", "townID": "CHHL000000", "townName": "哈尔滨", "townEN": "Haerbin"},
    "Qiqihaer": {
        "cityName": "齐齐哈尔",
        "cityEN": "Qiqihaer",
        "townID": "CHHL010000",
        "townName": "齐齐哈尔",
        "townEN": "Qiqihaer"
    },
    "齐齐哈尔": {
        "cityName": "齐齐哈尔",
        "cityEN": "Qiqihaer",
        "townID": "CHHL010000",
        "townName": "齐齐哈尔",
        "townEN": "Qiqihaer"
    },
    "Mudanjiang": {
        "cityName": "牡丹江",
        "cityEN": "Mudanjiang",
        "townID": "CHHL020000",
        "townName": "牡丹江",
        "townEN": "Mudanjiang"
    },
    "牡丹江": {
        "cityName": "牡丹江",
        "cityEN": "Mudanjiang",
        "townID": "CHHL020000",
        "townName": "牡丹江",
        "townEN": "Mudanjiang"
    },
    "Jiamusi": {"cityName": "佳木斯", "cityEN": "Jiamusi", "townID": "CHHL030000", "townName": "佳木斯", "townEN": "Jiamusi"},
    "佳木斯": {"cityName": "佳木斯", "cityEN": "Jiamusi", "townID": "CHHL030000", "townName": "佳木斯", "townEN": "Jiamusi"},
    "Suihua": {"cityName": "绥化", "cityEN": "Suihua", "townID": "CHHL040000", "townName": "绥化", "townEN": "Suihua"},
    "绥化": {"cityName": "绥化", "cityEN": "Suihua", "townID": "CHHL040000", "townName": "绥化", "townEN": "Suihua"},
    "Heihe": {"cityName": "黑河", "cityEN": "Heihe", "townID": "CHHL050000", "townName": "黑河", "townEN": "Heihe"},
    "黑河": {"cityName": "黑河", "cityEN": "Heihe", "townID": "CHHL050000", "townName": "黑河", "townEN": "Heihe"},
    "Daxinganling": {
        "cityName": "大兴安岭",
        "cityEN": "Daxinganling",
        "townID": "CHHL060000",
        "townName": "大兴安岭",
        "townEN": "Daxinganling"
    },
    "大兴安岭": {
        "cityName": "大兴安岭",
        "cityEN": "Daxinganling",
        "townID": "CHHL060000",
        "townName": "大兴安岭",
        "townEN": "Daxinganling"
    },
    "Yichun": {"cityName": "伊春", "cityEN": "Yichun", "townID": "CHHL070000", "townName": "伊春", "townEN": "Yichun"},
    "伊春": {"cityName": "伊春", "cityEN": "Yichun", "townID": "CHHL070000", "townName": "伊春", "townEN": "Yichun"},
    "Daqing": {"cityName": "大庆", "cityEN": "Daqing", "townID": "CHHL080000", "townName": "大庆", "townEN": "Daqing"},
    "大庆": {"cityName": "大庆", "cityEN": "Daqing", "townID": "CHHL080000", "townName": "大庆", "townEN": "Daqing"},
    "Qitaihe": {"cityName": "七台河", "cityEN": "Qitaihe", "townID": "CHHL090000", "townName": "七台河", "townEN": "Qitaihe"},
    "七台河": {"cityName": "七台河", "cityEN": "Qitaihe", "townID": "CHHL090000", "townName": "七台河", "townEN": "Qitaihe"},
    "Jixi": {"cityName": "鸡西", "cityEN": "Jixi", "townID": "CHHL100000", "townName": "鸡西", "townEN": "Jixi"},
    "鸡西": {"cityName": "鸡西", "cityEN": "Jixi", "townID": "CHHL100000", "townName": "鸡西", "townEN": "Jixi"},
    "Hegang": {"cityName": "鹤岗", "cityEN": "Hegang", "townID": "CHHL110000", "townName": "鹤岗", "townEN": "Hegang"},
    "鹤岗": {"cityName": "鹤岗", "cityEN": "Hegang", "townID": "CHHL110000", "townName": "鹤岗", "townEN": "Hegang"},
    "Shuangyashan": {
        "cityName": "双鸭山",
        "cityEN": "Shuangyashan",
        "townID": "CHHL120000",
        "townName": "双鸭山",
        "townEN": "Shuangyashan"
    },
    "双鸭山": {
        "cityName": "双鸭山",
        "cityEN": "Shuangyashan",
        "townID": "CHHL120000",
        "townName": "双鸭山",
        "townEN": "Shuangyashan"
    },
    "Changchun": {
        "cityName": "长春",
        "cityEN": "Changchun",
        "townID": "CHJL000000",
        "townName": "长春",
        "townEN": "Changchun"
    },
    "长春": {"cityName": "长春", "cityEN": "Changchun", "townID": "CHJL000000", "townName": "长春", "townEN": "Changchun"},
    "Jilin": {"cityName": "吉林", "cityEN": "Jilin", "townID": "CHJL010000", "townName": "吉林", "townEN": "Jilin"},
    "吉林": {"cityName": "吉林", "cityEN": "Jilin", "townID": "CHJL010000", "townName": "吉林", "townEN": "Jilin"},
    "Yanbian": {"cityName": "延边", "cityEN": "Yanbian", "townID": "CHJL020000", "townName": "延吉", "townEN": "Yanji"},
    "延边": {"cityName": "延边", "cityEN": "Yanbian", "townID": "CHJL020000", "townName": "延吉", "townEN": "Yanji"},
    "Siping": {"cityName": "四平", "cityEN": "Siping", "townID": "CHJL030000", "townName": "四平", "townEN": "Siping"},
    "四平": {"cityName": "四平", "cityEN": "Siping", "townID": "CHJL030000", "townName": "四平", "townEN": "Siping"},
    "Tonghua": {"cityName": "通化", "cityEN": "Tonghua", "townID": "CHJL040000", "townName": "通化", "townEN": "Tonghua"},
    "通化": {"cityName": "通化", "cityEN": "Tonghua", "townID": "CHJL040000", "townName": "通化", "townEN": "Tonghua"},
    "Baicheng": {
        "cityName": "白城",
        "cityEN": "Baicheng",
        "townID": "CHJL050000",
        "townName": "白城",
        "townEN": "Baicheng"
    },
    "白城": {"cityName": "白城", "cityEN": "Baicheng", "townID": "CHJL050000", "townName": "白城", "townEN": "Baicheng"},
    "Liaoyuan": {
        "cityName": "辽源",
        "cityEN": "Liaoyuan",
        "townID": "CHJL060000",
        "townName": "辽源",
        "townEN": "Liaoyuan"
    },
    "辽源": {"cityName": "辽源", "cityEN": "Liaoyuan", "townID": "CHJL060000", "townName": "辽源", "townEN": "Liaoyuan"},
    "Songyuan": {
        "cityName": "松原",
        "cityEN": "Songyuan",
        "townID": "CHJL070000",
        "townName": "松原",
        "townEN": "Songyuan"
    },
    "松原": {"cityName": "松原", "cityEN": "Songyuan", "townID": "CHJL070000", "townName": "松原", "townEN": "Songyuan"},
    "Baishan": {"cityName": "白山", "cityEN": "Baishan", "townID": "CHJL080000", "townName": "白山", "townEN": "Baishan"},
    "白山": {"cityName": "白山", "cityEN": "Baishan", "townID": "CHJL080000", "townName": "白山", "townEN": "Baishan"},
    "Shenyang": {
        "cityName": "沈阳",
        "cityEN": "Shenyang",
        "townID": "CHLN000000",
        "townName": "沈阳",
        "townEN": "Shenyang"
    },
    "沈阳": {"cityName": "沈阳", "cityEN": "Shenyang", "townID": "CHLN000000", "townName": "沈阳", "townEN": "Shenyang"},
    "Dalian": {"cityName": "大连", "cityEN": "Dalian", "townID": "CHLN010000", "townName": "大连", "townEN": "Dalian"},
    "大连": {"cityName": "大连", "cityEN": "Dalian", "townID": "CHLN010000", "townName": "大连", "townEN": "Dalian"},
    "Anshan": {"cityName": "鞍山", "cityEN": "Anshan", "townID": "CHLN020000", "townName": "鞍山", "townEN": "Anshan"},
    "鞍山": {"cityName": "鞍山", "cityEN": "Anshan", "townID": "CHLN020000", "townName": "鞍山", "townEN": "Anshan"},
    "Fushun": {"cityName": "抚顺", "cityEN": "Fushun", "townID": "CHLN030000", "townName": "抚顺", "townEN": "Fushun"},
    "抚顺": {"cityName": "抚顺", "cityEN": "Fushun", "townID": "CHLN030000", "townName": "抚顺", "townEN": "Fushun"},
    "Benxi": {"cityName": "本溪", "cityEN": "Benxi", "townID": "CHLN040000", "townName": "本溪", "townEN": "Benxi"},
    "本溪": {"cityName": "本溪", "cityEN": "Benxi", "townID": "CHLN040000", "townName": "本溪", "townEN": "Benxi"},
    "Dandong": {"cityName": "丹东", "cityEN": "Dandong", "townID": "CHLN050000", "townName": "丹东", "townEN": "Dandong"},
    "丹东": {"cityName": "丹东", "cityEN": "Dandong", "townID": "CHLN050000", "townName": "丹东", "townEN": "Dandong"},
    "Jinzhou": {"cityName": "锦州", "cityEN": "Jinzhou", "townID": "CHLN060000", "townName": "锦州", "townEN": "Jinzhou"},
    "锦州": {"cityName": "锦州", "cityEN": "Jinzhou", "townID": "CHLN060000", "townName": "锦州", "townEN": "Jinzhou"},
    "Yingkou": {"cityName": "营口", "cityEN": "Yingkou", "townID": "CHLN070000", "townName": "营口", "townEN": "Yingkou"},
    "营口": {"cityName": "营口", "cityEN": "Yingkou", "townID": "CHLN070000", "townName": "营口", "townEN": "Yingkou"},
    "Fuxin": {"cityName": "阜新", "cityEN": "Fuxin", "townID": "CHLN080000", "townName": "阜新", "townEN": "Fuxin"},
    "阜新": {"cityName": "阜新", "cityEN": "Fuxin", "townID": "CHLN080000", "townName": "阜新", "townEN": "Fuxin"},
    "Liaoyang": {
        "cityName": "辽阳",
        "cityEN": "Liaoyang",
        "townID": "CHLN090000",
        "townName": "辽阳",
        "townEN": "Liaoyang"
    },
    "辽阳": {"cityName": "辽阳", "cityEN": "Liaoyang", "townID": "CHLN090000", "townName": "辽阳", "townEN": "Liaoyang"},
    "Tieling": {"cityName": "铁岭", "cityEN": "Tieling", "townID": "CHLN100000", "townName": "铁岭", "townEN": "Tieling"},
    "铁岭": {"cityName": "铁岭", "cityEN": "Tieling", "townID": "CHLN100000", "townName": "铁岭", "townEN": "Tieling"},
    "Chaoyang": {
        "cityName": "朝阳",
        "cityEN": "Chaoyang",
        "townID": "CHLN110000",
        "townName": "朝阳",
        "townEN": "Chaoyang"
    },
    "朝阳": {"cityName": "朝阳", "cityEN": "Chaoyang", "townID": "CHLN110000", "townName": "朝阳", "townEN": "Chaoyang"},
    "Panjin": {"cityName": "盘锦", "cityEN": "Panjin", "townID": "CHLN120000", "townName": "盘锦", "townEN": "Panjin"},
    "盘锦": {"cityName": "盘锦", "cityEN": "Panjin", "townID": "CHLN120000", "townName": "盘锦", "townEN": "Panjin"},
    "Huludao": {"cityName": "葫芦岛", "cityEN": "Huludao", "townID": "CHLN130000", "townName": "葫芦岛", "townEN": "Huludao"},
    "葫芦岛": {"cityName": "葫芦岛", "cityEN": "Huludao", "townID": "CHLN130000", "townName": "葫芦岛", "townEN": "Huludao"},
    "Huhehaote": {
        "cityName": "呼和浩特",
        "cityEN": "Huhehaote",
        "townID": "CHNM000000",
        "townName": "呼和浩特",
        "townEN": "Huhehaote"
    },
    "呼和浩特": {
        "cityName": "呼和浩特",
        "cityEN": "Huhehaote",
        "townID": "CHNM000000",
        "townName": "呼和浩特",
        "townEN": "Huhehaote"
    },
    "Baotou": {"cityName": "包头", "cityEN": "Baotou", "townID": "CHNM010000", "townName": "包头", "townEN": "Baotou"},
    "包头": {"cityName": "包头", "cityEN": "Baotou", "townID": "CHNM010000", "townName": "包头", "townEN": "Baotou"},
    "Wuhai": {"cityName": "乌海", "cityEN": "Wuhai", "townID": "CHNM020000", "townName": "乌海", "townEN": "Wuhai"},
    "乌海": {"cityName": "乌海", "cityEN": "Wuhai", "townID": "CHNM020000", "townName": "乌海", "townEN": "Wuhai"},
    "Wulanchabu": {
        "cityName": "乌兰察布",
        "cityEN": "Wulanchabu",
        "townID": "CHNM030000",
        "townName": "集宁",
        "townEN": "Jining"
    },
    "乌兰察布": {"cityName": "乌兰察布", "cityEN": "Wulanchabu", "townID": "CHNM030000", "townName": "集宁", "townEN": "Jining"},
    "Tongliao": {
        "cityName": "通辽",
        "cityEN": "Tongliao",
        "townID": "CHNM040000",
        "townName": "通辽",
        "townEN": "Tongliao"
    },
    "通辽": {"cityName": "通辽", "cityEN": "Tongliao", "townID": "CHNM040000", "townName": "通辽", "townEN": "Tongliao"},
    "Chifeng": {"cityName": "赤峰", "cityEN": "Chifeng", "townID": "CHNM050000", "townName": "赤峰", "townEN": "Chifeng"},
    "赤峰": {"cityName": "赤峰", "cityEN": "Chifeng", "townID": "CHNM050000", "townName": "赤峰", "townEN": "Chifeng"},
    "Eerduosi": {
        "cityName": "鄂尔多斯",
        "cityEN": "Eerduosi",
        "townID": "CHNM060000",
        "townName": "鄂尔多斯",
        "townEN": "Eerduosi"
    },
    "鄂尔多斯": {
        "cityName": "鄂尔多斯",
        "cityEN": "Eerduosi",
        "townID": "CHNM060000",
        "townName": "鄂尔多斯",
        "townEN": "Eerduosi"
    },
    "Bayanzhuor": {
        "cityName": "巴彦淖尔",
        "cityEN": "Bayanzhuor",
        "townID": "CHNM070000",
        "townName": "临河",
        "townEN": "Linhe"
    },
    "巴彦淖尔": {"cityName": "巴彦淖尔", "cityEN": "Bayanzhuor", "townID": "CHNM070000", "townName": "临河", "townEN": "Linhe"},
    "Xilinguole": {
        "cityName": "锡林郭勒",
        "cityEN": "Xilinguole",
        "townID": "CHNM080000",
        "townName": "锡林浩特",
        "townEN": "Xilinhaote"
    },
    "锡林郭勒": {
        "cityName": "锡林郭勒",
        "cityEN": "Xilinguole",
        "townID": "CHNM080000",
        "townName": "锡林浩特",
        "townEN": "Xilinhaote"
    },
    "Hulunbeier": {
        "cityName": "呼伦贝尔",
        "cityEN": "Hulunbeier",
        "townID": "CHNM090000",
        "townName": "海拉尔",
        "townEN": "Hailaer"
    },
    "呼伦贝尔": {
        "cityName": "呼伦贝尔",
        "cityEN": "Hulunbeier",
        "townID": "CHNM090000",
        "townName": "海拉尔",
        "townEN": "Hailaer"
    },
    "Wulanhaote": {
        "cityName": "乌兰浩特",
        "cityEN": "Wulanhaote",
        "townID": "CHNM100000",
        "townName": "乌兰浩特",
        "townEN": "Wulanhaote"
    },
    "乌兰浩特": {
        "cityName": "乌兰浩特",
        "cityEN": "Wulanhaote",
        "townID": "CHNM100000",
        "townName": "乌兰浩特",
        "townEN": "Wulanhaote"
    },
    "Alashanmeng": {
        "cityName": "阿拉善盟",
        "cityEN": "Alashanmeng",
        "townID": "CHNM110000",
        "townName": "阿左旗",
        "townEN": "Azuoqi"
    },
    "阿拉善盟": {
        "cityName": "阿拉善盟",
        "cityEN": "Alashanmeng",
        "townID": "CHNM110000",
        "townName": "阿左旗",
        "townEN": "Azuoqi"
    },
    "Shijiazhuang": {
        "cityName": "石家庄",
        "cityEN": "Shijiazhuang",
        "townID": "CHHE000000",
        "townName": "石家庄",
        "townEN": "Shijiazhuang"
    },
    "石家庄": {
        "cityName": "石家庄",
        "cityEN": "Shijiazhuang",
        "townID": "CHHE000000",
        "townName": "石家庄",
        "townEN": "Shijiazhuang"
    },
    "Baoding": {"cityName": "保定", "cityEN": "Baoding", "townID": "CHHE010000", "townName": "保定", "townEN": "Baoding"},
    "保定": {"cityName": "保定", "cityEN": "Baoding", "townID": "CHHE010000", "townName": "保定", "townEN": "Baoding"},
    "Zhangjiakou": {
        "cityName": "张家口",
        "cityEN": "Zhangjiakou",
        "townID": "CHHE020000",
        "townName": "张家口",
        "townEN": "Zhangjiakou"
    },
    "张家口": {
        "cityName": "张家口",
        "cityEN": "Zhangjiakou",
        "townID": "CHHE020000",
        "townName": "张家口",
        "townEN": "Zhangjiakou"
    },
    "Chengde": {"cityName": "承德", "cityEN": "Chengde", "townID": "CHHE030000", "townName": "承德", "townEN": "Chengde"},
    "承德": {"cityName": "承德", "cityEN": "Chengde", "townID": "CHHE030000", "townName": "承德", "townEN": "Chengde"},
    "Tangshan": {
        "cityName": "唐山",
        "cityEN": "Tangshan",
        "townID": "CHHE040000",
        "townName": "唐山",
        "townEN": "Tangshan"
    },
    "唐山": {"cityName": "唐山", "cityEN": "Tangshan", "townID": "CHHE040000", "townName": "唐山", "townEN": "Tangshan"},
    "Langfang": {
        "cityName": "廊坊",
        "cityEN": "Langfang",
        "townID": "CHHE050000",
        "townName": "廊坊",
        "townEN": "Langfang"
    },
    "廊坊": {"cityName": "廊坊", "cityEN": "Langfang", "townID": "CHHE050000", "townName": "廊坊", "townEN": "Langfang"},
    "Cangzhou": {
        "cityName": "沧州",
        "cityEN": "Cangzhou",
        "townID": "CHHE060000",
        "townName": "沧州",
        "townEN": "Cangzhou"
    },
    "沧州": {"cityName": "沧州", "cityEN": "Cangzhou", "townID": "CHHE060000", "townName": "沧州", "townEN": "Cangzhou"},
    "Hengshui": {
        "cityName": "衡水",
        "cityEN": "Hengshui",
        "townID": "CHHE070000",
        "townName": "衡水",
        "townEN": "Hengshui"
    },
    "衡水": {"cityName": "衡水", "cityEN": "Hengshui", "townID": "CHHE070000", "townName": "衡水", "townEN": "Hengshui"},
    "Xingtai": {"cityName": "邢台", "cityEN": "Xingtai", "townID": "CHHE080000", "townName": "邢台", "townEN": "Xingtai"},
    "邢台": {"cityName": "邢台", "cityEN": "Xingtai", "townID": "CHHE080000", "townName": "邢台", "townEN": "Xingtai"},
    "Handan": {"cityName": "邯郸", "cityEN": "Handan", "townID": "CHHE090000", "townName": "邯郸", "townEN": "Handan"},
    "邯郸": {"cityName": "邯郸", "cityEN": "Handan", "townID": "CHHE090000", "townName": "邯郸", "townEN": "Handan"},
    "Qinhuangdao": {
        "cityName": "秦皇岛",
        "cityEN": "Qinhuangdao",
        "townID": "CHHE100000",
        "townName": "秦皇岛",
        "townEN": "Qinhuangdao"
    },
    "秦皇岛": {
        "cityName": "秦皇岛",
        "cityEN": "Qinhuangdao",
        "townID": "CHHE100000",
        "townName": "秦皇岛",
        "townEN": "Qinhuangdao"
    },
    "Zhengzhou": {
        "cityName": "郑州",
        "cityEN": "Zhengzhou",
        "townID": "CHHA000000",
        "townName": "郑州",
        "townEN": "Zhengzhou"
    },
    "郑州": {"cityName": "郑州", "cityEN": "Zhengzhou", "townID": "CHHA000000", "townName": "郑州", "townEN": "Zhengzhou"},
    "Anyang": {"cityName": "安阳", "cityEN": "Anyang", "townID": "CHHA010000", "townName": "安阳", "townEN": "Anyang"},
    "安阳": {"cityName": "安阳", "cityEN": "Anyang", "townID": "CHHA010000", "townName": "安阳", "townEN": "Anyang"},
    "Xinxiang": {
        "cityName": "新乡",
        "cityEN": "Xinxiang",
        "townID": "CHHA020000",
        "townName": "新乡",
        "townEN": "Xinxiang"
    },
    "新乡": {"cityName": "新乡", "cityEN": "Xinxiang", "townID": "CHHA020000", "townName": "新乡", "townEN": "Xinxiang"},
    "Xuchang": {"cityName": "许昌", "cityEN": "Xuchang", "townID": "CHHA030000", "townName": "许昌", "townEN": "Xuchang"},
    "许昌": {"cityName": "许昌", "cityEN": "Xuchang", "townID": "CHHA030000", "townName": "许昌", "townEN": "Xuchang"},
    "Pingdingshan": {
        "cityName": "平顶山",
        "cityEN": "Pingdingshan",
        "townID": "CHHA040000",
        "townName": "平顶山",
        "townEN": "Pingdingshan"
    },
    "平顶山": {
        "cityName": "平顶山",
        "cityEN": "Pingdingshan",
        "townID": "CHHA040000",
        "townName": "平顶山",
        "townEN": "Pingdingshan"
    },
    "Xinyang": {"cityName": "信阳", "cityEN": "Xinyang", "townID": "CHHA050000", "townName": "信阳", "townEN": "Xinyang"},
    "信阳": {"cityName": "信阳", "cityEN": "Xinyang", "townID": "CHHA050000", "townName": "信阳", "townEN": "Xinyang"},
    "Nanyang": {"cityName": "南阳", "cityEN": "Nanyang", "townID": "CHHA060000", "townName": "南阳", "townEN": "Nanyang"},
    "南阳": {"cityName": "南阳", "cityEN": "Nanyang", "townID": "CHHA060000", "townName": "南阳", "townEN": "Nanyang"},
    "Kaifeng": {"cityName": "开封", "cityEN": "Kaifeng", "townID": "CHHA070000", "townName": "开封", "townEN": "Kaifeng"},
    "开封": {"cityName": "开封", "cityEN": "Kaifeng", "townID": "CHHA070000", "townName": "开封", "townEN": "Kaifeng"},
    "Luoyang": {"cityName": "洛阳", "cityEN": "Luoyang", "townID": "CHHA080000", "townName": "洛阳", "townEN": "Luoyang"},
    "洛阳": {"cityName": "洛阳", "cityEN": "Luoyang", "townID": "CHHA080000", "townName": "洛阳", "townEN": "Luoyang"},
    "Shangqiu": {
        "cityName": "商丘",
        "cityEN": "Shangqiu",
        "townID": "CHHA090000",
        "townName": "商丘",
        "townEN": "Shangqiu"
    },
    "商丘": {"cityName": "商丘", "cityEN": "Shangqiu", "townID": "CHHA090000", "townName": "商丘", "townEN": "Shangqiu"},
    "Jiaozuo": {"cityName": "焦作", "cityEN": "Jiaozuo", "townID": "CHHA100000", "townName": "焦作", "townEN": "Jiaozuo"},
    "焦作": {"cityName": "焦作", "cityEN": "Jiaozuo", "townID": "CHHA100000", "townName": "焦作", "townEN": "Jiaozuo"},
    "Hebi": {"cityName": "鹤壁", "cityEN": "Hebi", "townID": "CHHA110000", "townName": "鹤壁", "townEN": "Hebi"},
    "鹤壁": {"cityName": "鹤壁", "cityEN": "Hebi", "townID": "CHHA110000", "townName": "鹤壁", "townEN": "Hebi"},
    "Puyang": {"cityName": "濮阳", "cityEN": "Puyang", "townID": "CHHA120000", "townName": "濮阳", "townEN": "Puyang"},
    "濮阳": {"cityName": "濮阳", "cityEN": "Puyang", "townID": "CHHA120000", "townName": "濮阳", "townEN": "Puyang"},
    "Zhoukou": {"cityName": "周口", "cityEN": "Zhoukou", "townID": "CHHA130000", "townName": "周口", "townEN": "Zhoukou"},
    "周口": {"cityName": "周口", "cityEN": "Zhoukou", "townID": "CHHA130000", "townName": "周口", "townEN": "Zhoukou"},
    "Luohe": {"cityName": "漯河", "cityEN": "Luohe", "townID": "CHHA140000", "townName": "漯河", "townEN": "Luohe"},
    "漯河": {"cityName": "漯河", "cityEN": "Luohe", "townID": "CHHA140000", "townName": "漯河", "townEN": "Luohe"},
    "Zhumadian": {
        "cityName": "驻马店",
        "cityEN": "Zhumadian",
        "townID": "CHHA150000",
        "townName": "驻马店",
        "townEN": "Zhumadian"
    },
    "驻马店": {"cityName": "驻马店", "cityEN": "Zhumadian", "townID": "CHHA150000", "townName": "驻马店", "townEN": "Zhumadian"},
    "Sanmenxia": {
        "cityName": "三门峡",
        "cityEN": "Sanmenxia",
        "townID": "CHHA160000",
        "townName": "三门峡",
        "townEN": "Sanmenxia"
    },
    "三门峡": {"cityName": "三门峡", "cityEN": "Sanmenxia", "townID": "CHHA160000", "townName": "三门峡", "townEN": "Sanmenxia"},
    "Jiyuan": {"cityName": "济源", "cityEN": "Jiyuan", "townID": "CHHA170000", "townName": "济源", "townEN": "Jiyuan"},
    "济源": {"cityName": "济源", "cityEN": "Jiyuan", "townID": "CHHA170000", "townName": "济源", "townEN": "Jiyuan"},
    "Taiyuan": {"cityName": "太原", "cityEN": "Taiyuan", "townID": "CHSX000000", "townName": "太原", "townEN": "Taiyuan"},
    "太原": {"cityName": "太原", "cityEN": "Taiyuan", "townID": "CHSX000000", "townName": "太原", "townEN": "Taiyuan"},
    "Datong": {"cityName": "大同", "cityEN": "Datong", "townID": "CHSX010000", "townName": "大同", "townEN": "Datong"},
    "大同": {"cityName": "大同", "cityEN": "Datong", "townID": "CHSX010000", "townName": "大同", "townEN": "Datong"},
    "Yangquan": {
        "cityName": "阳泉",
        "cityEN": "Yangquan",
        "townID": "CHSX020000",
        "townName": "阳泉",
        "townEN": "Yangquan"
    },
    "阳泉": {"cityName": "阳泉", "cityEN": "Yangquan", "townID": "CHSX020000", "townName": "阳泉", "townEN": "Yangquan"},
    "Jinzhong": {
        "cityName": "晋中",
        "cityEN": "Jinzhong",
        "townID": "CHSX030000",
        "townName": "晋中",
        "townEN": "Jinzhong"
    },
    "晋中": {"cityName": "晋中", "cityEN": "Jinzhong", "townID": "CHSX030000", "townName": "晋中", "townEN": "Jinzhong"},
    "Changzhi": {
        "cityName": "长治",
        "cityEN": "Changzhi",
        "townID": "CHSX040000",
        "townName": "长治",
        "townEN": "Changzhi"
    },
    "长治": {"cityName": "长治", "cityEN": "Changzhi", "townID": "CHSX040000", "townName": "长治", "townEN": "Changzhi"},
    "Jincheng": {
        "cityName": "晋城",
        "cityEN": "Jincheng",
        "townID": "CHSX050000",
        "townName": "晋城",
        "townEN": "Jincheng"
    },
    "晋城": {"cityName": "晋城", "cityEN": "Jincheng", "townID": "CHSX050000", "townName": "晋城", "townEN": "Jincheng"},
    "Linfen": {"cityName": "临汾", "cityEN": "Linfen", "townID": "CHSX060000", "townName": "临汾", "townEN": "Linfen"},
    "临汾": {"cityName": "临汾", "cityEN": "Linfen", "townID": "CHSX060000", "townName": "临汾", "townEN": "Linfen"},
    "Yuncheng": {
        "cityName": "运城",
        "cityEN": "Yuncheng",
        "townID": "CHSX070000",
        "townName": "运城",
        "townEN": "Yuncheng"
    },
    "运城": {"cityName": "运城", "cityEN": "Yuncheng", "townID": "CHSX070000", "townName": "运城", "townEN": "Yuncheng"},
    "Shuozhou": {
        "cityName": "朔州",
        "cityEN": "Shuozhou",
        "townID": "CHSX080000",
        "townName": "朔州",
        "townEN": "Shuozhou"
    },
    "朔州": {"cityName": "朔州", "cityEN": "Shuozhou", "townID": "CHSX080000", "townName": "朔州", "townEN": "Shuozhou"},
    "Xinzhou": {"cityName": "忻州", "cityEN": "Xinzhou", "townID": "CHSX090000", "townName": "忻州", "townEN": "Xinzhou"},
    "忻州": {"cityName": "忻州", "cityEN": "Xinzhou", "townID": "CHSX090000", "townName": "忻州", "townEN": "Xinzhou"},
    "Lvliang": {"cityName": "吕梁", "cityEN": "Lvliang", "townID": "CHSX100000", "townName": "吕梁", "townEN": "Lvliang"},
    "吕梁": {"cityName": "吕梁", "cityEN": "Lvliang", "townID": "CHSX100000", "townName": "吕梁", "townEN": "Lvliang"},
    "Jinan": {"cityName": "济南", "cityEN": "Jinan", "townID": "CHSD000000", "townName": "济南", "townEN": "Jinan"},
    "济南": {"cityName": "济南", "cityEN": "Jinan", "townID": "CHSD000000", "townName": "济南", "townEN": "Jinan"},
    "Qingdao": {"cityName": "青岛", "cityEN": "Qingdao", "townID": "CHSD010000", "townName": "青岛", "townEN": "Qingdao"},
    "青岛": {"cityName": "青岛", "cityEN": "Qingdao", "townID": "CHSD010000", "townName": "青岛", "townEN": "Qingdao"},
    "Zibo": {"cityName": "淄博", "cityEN": "Zibo", "townID": "CHSD020000", "townName": "淄博", "townEN": "Zibo"},
    "淄博": {"cityName": "淄博", "cityEN": "Zibo", "townID": "CHSD020000", "townName": "淄博", "townEN": "Zibo"},
    "Dezhou": {"cityName": "德州", "cityEN": "Dezhou", "townID": "CHSD030000", "townName": "德州", "townEN": "Dezhou"},
    "德州": {"cityName": "德州", "cityEN": "Dezhou", "townID": "CHSD030000", "townName": "德州", "townEN": "Dezhou"},
    "Yantai": {"cityName": "烟台", "cityEN": "Yantai", "townID": "CHSD040000", "townName": "烟台", "townEN": "Yantai"},
    "烟台": {"cityName": "烟台", "cityEN": "Yantai", "townID": "CHSD040000", "townName": "烟台", "townEN": "Yantai"},
    "Weifang": {"cityName": "潍坊", "cityEN": "Weifang", "townID": "CHSD050000", "townName": "潍坊", "townEN": "Weifang"},
    "潍坊": {"cityName": "潍坊", "cityEN": "Weifang", "townID": "CHSD050000", "townName": "潍坊", "townEN": "Weifang"},
    "Jining": {"cityName": "济宁", "cityEN": "Jining", "townID": "CHSD060000", "townName": "济宁", "townEN": "Jining"},
    "济宁": {"cityName": "济宁", "cityEN": "Jining", "townID": "CHSD060000", "townName": "济宁", "townEN": "Jining"},
    "Taian": {"cityName": "泰安", "cityEN": "Taian", "townID": "CHSD070000", "townName": "泰安", "townEN": "Taian"},
    "泰安": {"cityName": "泰安", "cityEN": "Taian", "townID": "CHSD070000", "townName": "泰安", "townEN": "Taian"},
    "Linyi": {"cityName": "临沂", "cityEN": "Linyi", "townID": "CHSD080000", "townName": "临沂", "townEN": "Linyi"},
    "临沂": {"cityName": "临沂", "cityEN": "Linyi", "townID": "CHSD080000", "townName": "临沂", "townEN": "Linyi"},
    "Heze": {"cityName": "菏泽", "cityEN": "Heze", "townID": "CHSD090000", "townName": "菏泽", "townEN": "Heze"},
    "菏泽": {"cityName": "菏泽", "cityEN": "Heze", "townID": "CHSD090000", "townName": "菏泽", "townEN": "Heze"},
    "Binzhou": {"cityName": "滨州", "cityEN": "Binzhou", "townID": "CHSD100000", "townName": "滨州", "townEN": "Binzhou"},
    "滨州": {"cityName": "滨州", "cityEN": "Binzhou", "townID": "CHSD100000", "townName": "滨州", "townEN": "Binzhou"},
    "Dongying": {
        "cityName": "东营",
        "cityEN": "Dongying",
        "townID": "CHSD110000",
        "townName": "东营",
        "townEN": "Dongying"
    },
    "东营": {"cityName": "东营", "cityEN": "Dongying", "townID": "CHSD110000", "townName": "东营", "townEN": "Dongying"},
    "Weihai": {"cityName": "威海", "cityEN": "Weihai", "townID": "CHSD120000", "townName": "威海", "townEN": "Weihai"},
    "威海": {"cityName": "威海", "cityEN": "Weihai", "townID": "CHSD120000", "townName": "威海", "townEN": "Weihai"},
    "Zaozhuang": {
        "cityName": "枣庄",
        "cityEN": "Zaozhuang",
        "townID": "CHSD130000",
        "townName": "枣庄",
        "townEN": "Zaozhuang"
    },
    "枣庄": {"cityName": "枣庄", "cityEN": "Zaozhuang", "townID": "CHSD130000", "townName": "枣庄", "townEN": "Zaozhuang"},
    "Rizhao": {"cityName": "日照", "cityEN": "Rizhao", "townID": "CHSD140000", "townName": "日照", "townEN": "Rizhao"},
    "日照": {"cityName": "日照", "cityEN": "Rizhao", "townID": "CHSD140000", "townName": "日照", "townEN": "Rizhao"},
    "Laiwu": {"cityName": "莱芜", "cityEN": "Laiwu", "townID": "CHSD150000", "townName": "莱芜", "townEN": "Laiwu"},
    "莱芜": {"cityName": "莱芜", "cityEN": "Laiwu", "townID": "CHSD150000", "townName": "莱芜", "townEN": "Laiwu"},
    "Liaocheng": {
        "cityName": "聊城",
        "cityEN": "Liaocheng",
        "townID": "CHSD160000",
        "townName": "聊城",
        "townEN": "Liaocheng"
    },
    "聊城": {"cityName": "聊城", "cityEN": "Liaocheng", "townID": "CHSD160000", "townName": "聊城", "townEN": "Liaocheng"},
    "Nanjing": {"cityName": "南京", "cityEN": "Nanjing", "townID": "CHJS000000", "townName": "南京", "townEN": "Nanjing"},
    "南京": {"cityName": "南京", "cityEN": "Nanjing", "townID": "CHJS000000", "townName": "南京", "townEN": "Nanjing"},
    "Wuxi": {"cityName": "无锡", "cityEN": "Wuxi", "townID": "CHJS010000", "townName": "无锡", "townEN": "Wuxi"},
    "无锡": {"cityName": "无锡", "cityEN": "Wuxi", "townID": "CHJS010000", "townName": "无锡", "townEN": "Wuxi"},
    "Zhenjiang": {
        "cityName": "镇江",
        "cityEN": "Zhenjiang",
        "townID": "CHJS020000",
        "townName": "镇江",
        "townEN": "Zhenjiang"
    },
    "镇江": {"cityName": "镇江", "cityEN": "Zhenjiang", "townID": "CHJS020000", "townName": "镇江", "townEN": "Zhenjiang"},
    "Suzhou": {"cityName": "苏州", "cityEN": "Suzhou", "townID": "CHJS030000", "townName": "苏州", "townEN": "Suzhou"},
    "苏州": {"cityName": "苏州", "cityEN": "Suzhou", "townID": "CHJS030000", "townName": "苏州", "townEN": "Suzhou"},
    "Nantong": {"cityName": "南通", "cityEN": "Nantong", "townID": "CHJS040000", "townName": "南通", "townEN": "Nantong"},
    "南通": {"cityName": "南通", "cityEN": "Nantong", "townID": "CHJS040000", "townName": "南通", "townEN": "Nantong"},
    "Yangzhou": {
        "cityName": "扬州",
        "cityEN": "Yangzhou",
        "townID": "CHJS050000",
        "townName": "扬州",
        "townEN": "Yangzhou"
    },
    "扬州": {"cityName": "扬州", "cityEN": "Yangzhou", "townID": "CHJS050000", "townName": "扬州", "townEN": "Yangzhou"},
    "Yancheng": {
        "cityName": "盐城",
        "cityEN": "Yancheng",
        "townID": "CHJS060000",
        "townName": "盐城",
        "townEN": "Yancheng"
    },
    "盐城": {"cityName": "盐城", "cityEN": "Yancheng", "townID": "CHJS060000", "townName": "盐城", "townEN": "Yancheng"},
    "Xuzhou": {"cityName": "徐州", "cityEN": "Xuzhou", "townID": "CHJS070000", "townName": "徐州", "townEN": "Xuzhou"},
    "徐州": {"cityName": "徐州", "cityEN": "Xuzhou", "townID": "CHJS070000", "townName": "徐州", "townEN": "Xuzhou"},
    "Huaian": {"cityName": "淮安", "cityEN": "Huaian", "townID": "CHJS080000", "townName": "淮安", "townEN": "Huaian"},
    "淮安": {"cityName": "淮安", "cityEN": "Huaian", "townID": "CHJS080000", "townName": "淮安", "townEN": "Huaian"},
    "Lianyungang": {
        "cityName": "连云港",
        "cityEN": "Lianyungang",
        "townID": "CHJS090000",
        "townName": "连云港",
        "townEN": "Lianyungang"
    },
    "连云港": {
        "cityName": "连云港",
        "cityEN": "Lianyungang",
        "townID": "CHJS090000",
        "townName": "连云港",
        "townEN": "Lianyungang"
    },
    "Changzhou": {
        "cityName": "常州",
        "cityEN": "Changzhou",
        "townID": "CHJS100000",
        "townName": "常州",
        "townEN": "Changzhou"
    },
    "常州": {"cityName": "常州", "cityEN": "Changzhou", "townID": "CHJS100000", "townName": "常州", "townEN": "Changzhou"},
    "Taizhou": {"cityName": "泰州", "cityEN": "Taizhou", "townID": "CHJS110000", "townName": "泰州", "townEN": "Taizhou"},
    "泰州": {"cityName": "泰州", "cityEN": "Taizhou", "townID": "CHJS110000", "townName": "泰州", "townEN": "Taizhou"},
    "Suqian": {"cityName": "宿迁", "cityEN": "Suqian", "townID": "CHJS120000", "townName": "宿迁", "townEN": "Suqian"},
    "宿迁": {"cityName": "宿迁", "cityEN": "Suqian", "townID": "CHJS120000", "townName": "宿迁", "townEN": "Suqian"},
    "Hangzhou": {
        "cityName": "杭州",
        "cityEN": "Hangzhou",
        "townID": "CHZJ000000",
        "townName": "杭州",
        "townEN": "Hangzhou"
    },
    "杭州": {"cityName": "杭州", "cityEN": "Hangzhou", "townID": "CHZJ000000", "townName": "杭州", "townEN": "Hangzhou"},
    "Huzhou": {"cityName": "湖州", "cityEN": "Huzhou", "townID": "CHZJ010000", "townName": "湖州", "townEN": "Huzhou"},
    "湖州": {"cityName": "湖州", "cityEN": "Huzhou", "townID": "CHZJ010000", "townName": "湖州", "townEN": "Huzhou"},
    "Jiaxing": {"cityName": "嘉兴", "cityEN": "Jiaxing", "townID": "CHZJ020000", "townName": "嘉兴", "townEN": "Jiaxing"},
    "嘉兴": {"cityName": "嘉兴", "cityEN": "Jiaxing", "townID": "CHZJ020000", "townName": "嘉兴", "townEN": "Jiaxing"},
    "Ningbo": {"cityName": "宁波", "cityEN": "Ningbo", "townID": "CHZJ030000", "townName": "宁波", "townEN": "Ningbo"},
    "宁波": {"cityName": "宁波", "cityEN": "Ningbo", "townID": "CHZJ030000", "townName": "宁波", "townEN": "Ningbo"},
    "Shaoxing": {
        "cityName": "绍兴",
        "cityEN": "Shaoxing",
        "townID": "CHZJ040000",
        "townName": "绍兴",
        "townEN": "Shaoxing"
    },
    "绍兴": {"cityName": "绍兴", "cityEN": "Shaoxing", "townID": "CHZJ040000", "townName": "绍兴", "townEN": "Shaoxing"},
    "Wenzhou": {"cityName": "温州", "cityEN": "Wenzhou", "townID": "CHZJ060000", "townName": "温州", "townEN": "Wenzhou"},
    "温州": {"cityName": "温州", "cityEN": "Wenzhou", "townID": "CHZJ060000", "townName": "温州", "townEN": "Wenzhou"},
    "Lishui": {"cityName": "丽水", "cityEN": "Lishui", "townID": "CHZJ070000", "townName": "丽水", "townEN": "Lishui"},
    "丽水": {"cityName": "丽水", "cityEN": "Lishui", "townID": "CHZJ070000", "townName": "丽水", "townEN": "Lishui"},
    "Jinhua": {"cityName": "金华", "cityEN": "Jinhua", "townID": "CHZJ080000", "townName": "金华", "townEN": "Jinhua"},
    "金华": {"cityName": "金华", "cityEN": "Jinhua", "townID": "CHZJ080000", "townName": "金华", "townEN": "Jinhua"},
    "Quzhou": {"cityName": "衢州", "cityEN": "Quzhou", "townID": "CHZJ090000", "townName": "衢州", "townEN": "Quzhou"},
    "衢州": {"cityName": "衢州", "cityEN": "Quzhou", "townID": "CHZJ090000", "townName": "衢州", "townEN": "Quzhou"},
    "Zhoushan": {
        "cityName": "舟山",
        "cityEN": "Zhoushan",
        "townID": "CHZJ100000",
        "townName": "舟山",
        "townEN": "Zhoushan"
    },
    "舟山": {"cityName": "舟山", "cityEN": "Zhoushan", "townID": "CHZJ100000", "townName": "舟山", "townEN": "Zhoushan"},
    "Fuzhou": {"cityName": "福州", "cityEN": "Fuzhou", "townID": "CHFJ000000", "townName": "福州", "townEN": "Fuzhou"},
    "福州": {"cityName": "福州", "cityEN": "Fuzhou", "townID": "CHFJ000000", "townName": "福州", "townEN": "Fuzhou"},
    "Xiamen": {"cityName": "厦门", "cityEN": "Xiamen", "townID": "CHFJ010000", "townName": "厦门", "townEN": "Xiamen"},
    "厦门": {"cityName": "厦门", "cityEN": "Xiamen", "townID": "CHFJ010000", "townName": "厦门", "townEN": "Xiamen"},
    "Ningde": {"cityName": "宁德", "cityEN": "Ningde", "townID": "CHFJ020000", "townName": "宁德", "townEN": "Ningde"},
    "宁德": {"cityName": "宁德", "cityEN": "Ningde", "townID": "CHFJ020000", "townName": "宁德", "townEN": "Ningde"},
    "Putian": {"cityName": "莆田", "cityEN": "Putian", "townID": "CHFJ030000", "townName": "莆田", "townEN": "Putian"},
    "莆田": {"cityName": "莆田", "cityEN": "Putian", "townID": "CHFJ030000", "townName": "莆田", "townEN": "Putian"},
    "Quanzhou": {
        "cityName": "泉州",
        "cityEN": "Quanzhou",
        "townID": "CHFJ040000",
        "townName": "泉州",
        "townEN": "Quanzhou"
    },
    "泉州": {"cityName": "泉州", "cityEN": "Quanzhou", "townID": "CHFJ040000", "townName": "泉州", "townEN": "Quanzhou"},
    "Zhangzhou": {
        "cityName": "漳州",
        "cityEN": "Zhangzhou",
        "townID": "CHFJ050000",
        "townName": "漳州",
        "townEN": "Zhangzhou"
    },
    "漳州": {"cityName": "漳州", "cityEN": "Zhangzhou", "townID": "CHFJ050000", "townName": "漳州", "townEN": "Zhangzhou"},
    "Longyan": {"cityName": "龙岩", "cityEN": "Longyan", "townID": "CHFJ060000", "townName": "龙岩", "townEN": "Longyan"},
    "龙岩": {"cityName": "龙岩", "cityEN": "Longyan", "townID": "CHFJ060000", "townName": "龙岩", "townEN": "Longyan"},
    "Sanming": {"cityName": "三明", "cityEN": "Sanming", "townID": "CHFJ070000", "townName": "三明", "townEN": "Sanming"},
    "三明": {"cityName": "三明", "cityEN": "Sanming", "townID": "CHFJ070000", "townName": "三明", "townEN": "Sanming"},
    "Nanping": {"cityName": "南平", "cityEN": "Nanping", "townID": "CHFJ080000", "townName": "南平", "townEN": "Nanping"},
    "南平": {"cityName": "南平", "cityEN": "Nanping", "townID": "CHFJ080000", "townName": "南平", "townEN": "Nanping"},
    "Nanchang": {
        "cityName": "南昌",
        "cityEN": "Nanchang",
        "townID": "CHJX000000",
        "townName": "南昌",
        "townEN": "Nanchang"
    },
    "南昌": {"cityName": "南昌", "cityEN": "Nanchang", "townID": "CHJX000000", "townName": "南昌", "townEN": "Nanchang"},
    "Jiujiang": {
        "cityName": "九江",
        "cityEN": "Jiujiang",
        "townID": "CHJX010000",
        "townName": "九江",
        "townEN": "Jiujiang"
    },
    "九江": {"cityName": "九江", "cityEN": "Jiujiang", "townID": "CHJX010000", "townName": "九江", "townEN": "Jiujiang"},
    "Shangrao": {
        "cityName": "上饶",
        "cityEN": "Shangrao",
        "townID": "CHJX020000",
        "townName": "上饶",
        "townEN": "Shangrao"
    },
    "上饶": {"cityName": "上饶", "cityEN": "Shangrao", "townID": "CHJX020000", "townName": "上饶", "townEN": "Shangrao"},
    "Jian": {"cityName": "吉安", "cityEN": "Jian", "townID": "CHJX050000", "townName": "吉安", "townEN": "Jian"},
    "吉安": {"cityName": "吉安", "cityEN": "Jian", "townID": "CHJX050000", "townName": "吉安", "townEN": "Jian"},
    "Ganzhou": {"cityName": "赣州", "cityEN": "Ganzhou", "townID": "CHJX060000", "townName": "赣州", "townEN": "Ganzhou"},
    "赣州": {"cityName": "赣州", "cityEN": "Ganzhou", "townID": "CHJX060000", "townName": "赣州", "townEN": "Ganzhou"},
    "Jingdezhen": {
        "cityName": "景德镇",
        "cityEN": "Jingdezhen",
        "townID": "CHJX070000",
        "townName": "景德镇",
        "townEN": "Jingdezhen"
    },
    "景德镇": {
        "cityName": "景德镇",
        "cityEN": "Jingdezhen",
        "townID": "CHJX070000",
        "townName": "景德镇",
        "townEN": "Jingdezhen"
    },
    "Pingxiang": {
        "cityName": "萍乡",
        "cityEN": "Pingxiang",
        "townID": "CHJX080000",
        "townName": "萍乡",
        "townEN": "Pingxiang"
    },
    "萍乡": {"cityName": "萍乡", "cityEN": "Pingxiang", "townID": "CHJX080000", "townName": "萍乡", "townEN": "Pingxiang"},
    "Xinyu": {"cityName": "新余", "cityEN": "Xinyu", "townID": "CHJX090000", "townName": "新余", "townEN": "Xinyu"},
    "新余": {"cityName": "新余", "cityEN": "Xinyu", "townID": "CHJX090000", "townName": "新余", "townEN": "Xinyu"},
    "Yingtan": {"cityName": "鹰潭", "cityEN": "Yingtan", "townID": "CHJX100000", "townName": "鹰潭", "townEN": "Yingtan"},
    "鹰潭": {"cityName": "鹰潭", "cityEN": "Yingtan", "townID": "CHJX100000", "townName": "鹰潭", "townEN": "Yingtan"},
    "Hefei": {"cityName": "合肥", "cityEN": "Hefei", "townID": "CHAH000000", "townName": "合肥", "townEN": "Hefei"},
    "合肥": {"cityName": "合肥", "cityEN": "Hefei", "townID": "CHAH000000", "townName": "合肥", "townEN": "Hefei"},
    "Bengbu": {"cityName": "蚌埠", "cityEN": "Bengbu", "townID": "CHAH010000", "townName": "蚌埠", "townEN": "Bengbu"},
    "蚌埠": {"cityName": "蚌埠", "cityEN": "Bengbu", "townID": "CHAH010000", "townName": "蚌埠", "townEN": "Bengbu"},
    "Wuhu": {"cityName": "芜湖", "cityEN": "Wuhu", "townID": "CHAH020000", "townName": "芜湖", "townEN": "Wuhu"},
    "芜湖": {"cityName": "芜湖", "cityEN": "Wuhu", "townID": "CHAH020000", "townName": "芜湖", "townEN": "Wuhu"},
    "Huainan": {"cityName": "淮南", "cityEN": "Huainan", "townID": "CHAH030000", "townName": "淮南", "townEN": "Huainan"},
    "淮南": {"cityName": "淮南", "cityEN": "Huainan", "townID": "CHAH030000", "townName": "淮南", "townEN": "Huainan"},
    "Maanshan": {
        "cityName": "马鞍山",
        "cityEN": "Maanshan",
        "townID": "CHAH040000",
        "townName": "马鞍山",
        "townEN": "Maanshan"
    },
    "马鞍山": {"cityName": "马鞍山", "cityEN": "Maanshan", "townID": "CHAH040000", "townName": "马鞍山", "townEN": "Maanshan"},
    "Anqing": {"cityName": "安庆", "cityEN": "Anqing", "townID": "CHAH050000", "townName": "安庆", "townEN": "Anqing"},
    "安庆": {"cityName": "安庆", "cityEN": "Anqing", "townID": "CHAH050000", "townName": "安庆", "townEN": "Anqing"},
    "Fuyang": {"cityName": "阜阳", "cityEN": "Fuyang", "townID": "CHAH070000", "townName": "阜阳", "townEN": "Fuyang"},
    "阜阳": {"cityName": "阜阳", "cityEN": "Fuyang", "townID": "CHAH070000", "townName": "阜阳", "townEN": "Fuyang"},
    "Bozhou": {"cityName": "亳州", "cityEN": "Bozhou", "townID": "CHAH080000", "townName": "亳州", "townEN": "Bozhou"},
    "亳州": {"cityName": "亳州", "cityEN": "Bozhou", "townID": "CHAH080000", "townName": "亳州", "townEN": "Bozhou"},
    "Huangshan": {
        "cityName": "黄山",
        "cityEN": "Huangshan",
        "townID": "CHAH090000",
        "townName": "黄山",
        "townEN": "Huangshan"
    },
    "黄山": {"cityName": "黄山", "cityEN": "Huangshan", "townID": "CHAH090000", "townName": "黄山", "townEN": "Huangshan"},
    "Chuzhou": {"cityName": "滁州", "cityEN": "Chuzhou", "townID": "CHAH100000", "townName": "滁州", "townEN": "Chuzhou"},
    "滁州": {"cityName": "滁州", "cityEN": "Chuzhou", "townID": "CHAH100000", "townName": "滁州", "townEN": "Chuzhou"},
    "Huaibei": {"cityName": "淮北", "cityEN": "Huaibei", "townID": "CHAH110000", "townName": "淮北", "townEN": "Huaibei"},
    "淮北": {"cityName": "淮北", "cityEN": "Huaibei", "townID": "CHAH110000", "townName": "淮北", "townEN": "Huaibei"},
    "Tongling": {
        "cityName": "铜陵",
        "cityEN": "Tongling",
        "townID": "CHAH120000",
        "townName": "铜陵",
        "townEN": "Tongling"
    },
    "铜陵": {"cityName": "铜陵", "cityEN": "Tongling", "townID": "CHAH120000", "townName": "铜陵", "townEN": "Tongling"},
    "Xuancheng": {
        "cityName": "宣城",
        "cityEN": "Xuancheng",
        "townID": "CHAH130000",
        "townName": "宣城",
        "townEN": "Xuancheng"
    },
    "宣城": {"cityName": "宣城", "cityEN": "Xuancheng", "townID": "CHAH130000", "townName": "宣城", "townEN": "Xuancheng"},
    "Luan": {"cityName": "六安", "cityEN": "Luan", "townID": "CHAH140000", "townName": "六安", "townEN": "Luan"},
    "六安": {"cityName": "六安", "cityEN": "Luan", "townID": "CHAH140000", "townName": "六安", "townEN": "Luan"},
    "Chizhou": {"cityName": "池州", "cityEN": "Chizhou", "townID": "CHAH160000", "townName": "池州", "townEN": "Chizhou"},
    "池州": {"cityName": "池州", "cityEN": "Chizhou", "townID": "CHAH160000", "townName": "池州", "townEN": "Chizhou"},
    "Wuhan": {"cityName": "武汉", "cityEN": "Wuhan", "townID": "CHHB000000", "townName": "武汉", "townEN": "Wuhan"},
    "武汉": {"cityName": "武汉", "cityEN": "Wuhan", "townID": "CHHB000000", "townName": "武汉", "townEN": "Wuhan"},
    "Xiangyang": {
        "cityName": "襄阳",
        "cityEN": "Xiangyang",
        "townID": "CHHB010000",
        "townName": "襄阳",
        "townEN": "Xiangyang"
    },
    "襄阳": {"cityName": "襄阳", "cityEN": "Xiangyang", "townID": "CHHB010000", "townName": "襄阳", "townEN": "Xiangyang"},
    "Ezhou": {"cityName": "鄂州", "cityEN": "Ezhou", "townID": "CHHB020000", "townName": "鄂州", "townEN": "Ezhou"},
    "鄂州": {"cityName": "鄂州", "cityEN": "Ezhou", "townID": "CHHB020000", "townName": "鄂州", "townEN": "Ezhou"},
    "Xiaogan": {"cityName": "孝感", "cityEN": "Xiaogan", "townID": "CHHB030000", "townName": "孝感", "townEN": "Xiaogan"},
    "孝感": {"cityName": "孝感", "cityEN": "Xiaogan", "townID": "CHHB030000", "townName": "孝感", "townEN": "Xiaogan"},
    "Huanggang": {
        "cityName": "黄冈",
        "cityEN": "Huanggang",
        "townID": "CHHB040000",
        "townName": "黄冈",
        "townEN": "Huanggang"
    },
    "黄冈": {"cityName": "黄冈", "cityEN": "Huanggang", "townID": "CHHB040000", "townName": "黄冈", "townEN": "Huanggang"},
    "Huangshi": {
        "cityName": "黄石",
        "cityEN": "Huangshi",
        "townID": "CHHB050000",
        "townName": "黄石",
        "townEN": "Huangshi"
    },
    "黄石": {"cityName": "黄石", "cityEN": "Huangshi", "townID": "CHHB050000", "townName": "黄石", "townEN": "Huangshi"},
    "Xianning": {
        "cityName": "咸宁",
        "cityEN": "Xianning",
        "townID": "CHHB060000",
        "townName": "咸宁",
        "townEN": "Xianning"
    },
    "咸宁": {"cityName": "咸宁", "cityEN": "Xianning", "townID": "CHHB060000", "townName": "咸宁", "townEN": "Xianning"},
    "Jingzhou": {
        "cityName": "荆州",
        "cityEN": "Jingzhou",
        "townID": "CHHB070000",
        "townName": "荆州",
        "townEN": "Jingzhou"
    },
    "荆州": {"cityName": "荆州", "cityEN": "Jingzhou", "townID": "CHHB070000", "townName": "荆州", "townEN": "Jingzhou"},
    "Yichang": {"cityName": "宜昌", "cityEN": "Yichang", "townID": "CHHB080000", "townName": "宜昌", "townEN": "Yichang"},
    "宜昌": {"cityName": "宜昌", "cityEN": "Yichang", "townID": "CHHB080000", "townName": "宜昌", "townEN": "Yichang"},
    "Enshi": {"cityName": "恩施", "cityEN": "Enshi", "townID": "CHHB090000", "townName": "恩施", "townEN": "Enshi"},
    "恩施": {"cityName": "恩施", "cityEN": "Enshi", "townID": "CHHB090000", "townName": "恩施", "townEN": "Enshi"},
    "Shiyan": {"cityName": "十堰", "cityEN": "Shiyan", "townID": "CHHB100000", "townName": "十堰", "townEN": "Shiyan"},
    "十堰": {"cityName": "十堰", "cityEN": "Shiyan", "townID": "CHHB100000", "townName": "十堰", "townEN": "Shiyan"},
    "Shennongjia": {
        "cityName": "神农架",
        "cityEN": "Shennongjia",
        "townID": "CHHB110000",
        "townName": "神农架",
        "townEN": "Shennongjia"
    },
    "神农架": {
        "cityName": "神农架",
        "cityEN": "Shennongjia",
        "townID": "CHHB110000",
        "townName": "神农架",
        "townEN": "Shennongjia"
    },
    "Suizhou": {"cityName": "随州", "cityEN": "Suizhou", "townID": "CHHB120000", "townName": "随州", "townEN": "Suizhou"},
    "随州": {"cityName": "随州", "cityEN": "Suizhou", "townID": "CHHB120000", "townName": "随州", "townEN": "Suizhou"},
    "Jingmen": {"cityName": "荆门", "cityEN": "Jingmen", "townID": "CHHB130000", "townName": "荆门", "townEN": "Jingmen"},
    "荆门": {"cityName": "荆门", "cityEN": "Jingmen", "townID": "CHHB130000", "townName": "荆门", "townEN": "Jingmen"},
    "Tianmen": {"cityName": "天门", "cityEN": "Tianmen", "townID": "CHHB140000", "townName": "天门", "townEN": "Tianmen"},
    "天门": {"cityName": "天门", "cityEN": "Tianmen", "townID": "CHHB140000", "townName": "天门", "townEN": "Tianmen"},
    "Xiantao": {"cityName": "仙桃", "cityEN": "Xiantao", "townID": "CHHB150000", "townName": "仙桃", "townEN": "Xiantao"},
    "仙桃": {"cityName": "仙桃", "cityEN": "Xiantao", "townID": "CHHB150000", "townName": "仙桃", "townEN": "Xiantao"},
    "Qianjiang": {
        "cityName": "潜江",
        "cityEN": "Qianjiang",
        "townID": "CHHB160000",
        "townName": "潜江",
        "townEN": "Qianjiang"
    },
    "潜江": {"cityName": "潜江", "cityEN": "Qianjiang", "townID": "CHHB160000", "townName": "潜江", "townEN": "Qianjiang"},
    "Changsha": {
        "cityName": "长沙",
        "cityEN": "Changsha",
        "townID": "CHHN000000",
        "townName": "长沙",
        "townEN": "Changsha"
    },
    "长沙": {"cityName": "长沙", "cityEN": "Changsha", "townID": "CHHN000000", "townName": "长沙", "townEN": "Changsha"},
    "Xiangtan": {
        "cityName": "湘潭",
        "cityEN": "Xiangtan",
        "townID": "CHHN010000",
        "townName": "湘潭",
        "townEN": "Xiangtan"
    },
    "湘潭": {"cityName": "湘潭", "cityEN": "Xiangtan", "townID": "CHHN010000", "townName": "湘潭", "townEN": "Xiangtan"},
    "Zhuzhou": {"cityName": "株洲", "cityEN": "Zhuzhou", "townID": "CHHN020000", "townName": "株洲", "townEN": "Zhuzhou"},
    "株洲": {"cityName": "株洲", "cityEN": "Zhuzhou", "townID": "CHHN020000", "townName": "株洲", "townEN": "Zhuzhou"},
    "Hengyang": {
        "cityName": "衡阳",
        "cityEN": "Hengyang",
        "townID": "CHHN030000",
        "townName": "衡阳",
        "townEN": "Hengyang"
    },
    "衡阳": {"cityName": "衡阳", "cityEN": "Hengyang", "townID": "CHHN030000", "townName": "衡阳", "townEN": "Hengyang"},
    "Chenzhou": {
        "cityName": "郴州",
        "cityEN": "Chenzhou",
        "townID": "CHHN040000",
        "townName": "郴州",
        "townEN": "Chenzhou"
    },
    "郴州": {"cityName": "郴州", "cityEN": "Chenzhou", "townID": "CHHN040000", "townName": "郴州", "townEN": "Chenzhou"},
    "Changde": {"cityName": "常德", "cityEN": "Changde", "townID": "CHHN050000", "townName": "常德", "townEN": "Changde"},
    "常德": {"cityName": "常德", "cityEN": "Changde", "townID": "CHHN050000", "townName": "常德", "townEN": "Changde"},
    "Yiyang": {"cityName": "益阳", "cityEN": "Yiyang", "townID": "CHHN060000", "townName": "益阳", "townEN": "Yiyang"},
    "益阳": {"cityName": "益阳", "cityEN": "Yiyang", "townID": "CHHN060000", "townName": "益阳", "townEN": "Yiyang"},
    "Loudi": {"cityName": "娄底", "cityEN": "Loudi", "townID": "CHHN070000", "townName": "娄底", "townEN": "Loudi"},
    "娄底": {"cityName": "娄底", "cityEN": "Loudi", "townID": "CHHN070000", "townName": "娄底", "townEN": "Loudi"},
    "Shaoyang": {
        "cityName": "邵阳",
        "cityEN": "Shaoyang",
        "townID": "CHHN080000",
        "townName": "邵阳",
        "townEN": "Shaoyang"
    },
    "邵阳": {"cityName": "邵阳", "cityEN": "Shaoyang", "townID": "CHHN080000", "townName": "邵阳", "townEN": "Shaoyang"},
    "Yueyang": {"cityName": "岳阳", "cityEN": "Yueyang", "townID": "CHHN090000", "townName": "岳阳", "townEN": "Yueyang"},
    "岳阳": {"cityName": "岳阳", "cityEN": "Yueyang", "townID": "CHHN090000", "townName": "岳阳", "townEN": "Yueyang"},
    "Zhangjiajie": {
        "cityName": "张家界",
        "cityEN": "Zhangjiajie",
        "townID": "CHHN100000",
        "townName": "张家界",
        "townEN": "Zhangjiajie"
    },
    "张家界": {
        "cityName": "张家界",
        "cityEN": "Zhangjiajie",
        "townID": "CHHN100000",
        "townName": "张家界",
        "townEN": "Zhangjiajie"
    },
    "Huaihua": {"cityName": "怀化", "cityEN": "Huaihua", "townID": "CHHN110000", "townName": "怀化", "townEN": "Huaihua"},
    "怀化": {"cityName": "怀化", "cityEN": "Huaihua", "townID": "CHHN110000", "townName": "怀化", "townEN": "Huaihua"},
    "Yongzhou": {
        "cityName": "永州",
        "cityEN": "Yongzhou",
        "townID": "CHHN120000",
        "townName": "永州",
        "townEN": "Yongzhou"
    },
    "永州": {"cityName": "永州", "cityEN": "Yongzhou", "townID": "CHHN120000", "townName": "永州", "townEN": "Yongzhou"},
    "Xiangxi": {"cityName": "湘西", "cityEN": "Xiangxi", "townID": "CHHN130000", "townName": "吉首", "townEN": "Jishou"},
    "湘西": {"cityName": "湘西", "cityEN": "Xiangxi", "townID": "CHHN130000", "townName": "吉首", "townEN": "Jishou"},
    "Guangzhou": {
        "cityName": "广州",
        "cityEN": "Guangzhou",
        "townID": "CHGD000000",
        "townName": "广州",
        "townEN": "Guangzhou"
    },
    "广州": {"cityName": "广州", "cityEN": "Guangzhou", "townID": "CHGD000000", "townName": "广州", "townEN": "Guangzhou"},
    "Shaoguan": {
        "cityName": "韶关",
        "cityEN": "Shaoguan",
        "townID": "CHGD010000",
        "townName": "韶关",
        "townEN": "Shaoguan"
    },
    "韶关": {"cityName": "韶关", "cityEN": "Shaoguan", "townID": "CHGD010000", "townName": "韶关", "townEN": "Shaoguan"},
    "Huizhou": {"cityName": "惠州", "cityEN": "Huizhou", "townID": "CHGD020000", "townName": "惠州", "townEN": "Huizhou"},
    "惠州": {"cityName": "惠州", "cityEN": "Huizhou", "townID": "CHGD020000", "townName": "惠州", "townEN": "Huizhou"},
    "Meizhou": {"cityName": "梅州", "cityEN": "Meizhou", "townID": "CHGD030000", "townName": "梅州", "townEN": "Meizhou"},
    "梅州": {"cityName": "梅州", "cityEN": "Meizhou", "townID": "CHGD030000", "townName": "梅州", "townEN": "Meizhou"},
    "Shantou": {"cityName": "汕头", "cityEN": "Shantou", "townID": "CHGD040000", "townName": "汕头", "townEN": "Shantou"},
    "汕头": {"cityName": "汕头", "cityEN": "Shantou", "townID": "CHGD040000", "townName": "汕头", "townEN": "Shantou"},
    "Shenzhen": {
        "cityName": "深圳",
        "cityEN": "Shenzhen",
        "townID": "CHGD050000",
        "townName": "深圳",
        "townEN": "Shenzhen"
    },
    "深圳": {"cityName": "深圳", "cityEN": "Shenzhen", "townID": "CHGD050000", "townName": "深圳", "townEN": "Shenzhen"},
    "Zhuhai": {"cityName": "珠海", "cityEN": "Zhuhai", "townID": "CHGD060000", "townName": "珠海", "townEN": "Zhuhai"},
    "珠海": {"cityName": "珠海", "cityEN": "Zhuhai", "townID": "CHGD060000", "townName": "珠海", "townEN": "Zhuhai"},
    "Foshan": {"cityName": "佛山", "cityEN": "Foshan", "townID": "CHGD070000", "townName": "佛山", "townEN": "Foshan"},
    "佛山": {"cityName": "佛山", "cityEN": "Foshan", "townID": "CHGD070000", "townName": "佛山", "townEN": "Foshan"},
    "Zhaoqing": {
        "cityName": "肇庆",
        "cityEN": "Zhaoqing",
        "townID": "CHGD080000",
        "townName": "肇庆",
        "townEN": "Zhaoqing"
    },
    "肇庆": {"cityName": "肇庆", "cityEN": "Zhaoqing", "townID": "CHGD080000", "townName": "肇庆", "townEN": "Zhaoqing"},
    "Zhanjiang": {
        "cityName": "湛江",
        "cityEN": "Zhanjiang",
        "townID": "CHGD090000",
        "townName": "湛江",
        "townEN": "Zhanjiang"
    },
    "湛江": {"cityName": "湛江", "cityEN": "Zhanjiang", "townID": "CHGD090000", "townName": "湛江", "townEN": "Zhanjiang"},
    "Jiangmen": {
        "cityName": "江门",
        "cityEN": "Jiangmen",
        "townID": "CHGD100000",
        "townName": "江门",
        "townEN": "Jiangmen"
    },
    "江门": {"cityName": "江门", "cityEN": "Jiangmen", "townID": "CHGD100000", "townName": "江门", "townEN": "Jiangmen"},
    "Heyuan": {"cityName": "河源", "cityEN": "Heyuan", "townID": "CHGD110000", "townName": "河源", "townEN": "Heyuan"},
    "河源": {"cityName": "河源", "cityEN": "Heyuan", "townID": "CHGD110000", "townName": "河源", "townEN": "Heyuan"},
    "Qingyuan": {
        "cityName": "清远",
        "cityEN": "Qingyuan",
        "townID": "CHGD120000",
        "townName": "清远",
        "townEN": "Qingyuan"
    },
    "清远": {"cityName": "清远", "cityEN": "Qingyuan", "townID": "CHGD120000", "townName": "清远", "townEN": "Qingyuan"},
    "Yunfu": {"cityName": "云浮", "cityEN": "Yunfu", "townID": "CHGD130000", "townName": "云浮", "townEN": "Yunfu"},
    "云浮": {"cityName": "云浮", "cityEN": "Yunfu", "townID": "CHGD130000", "townName": "云浮", "townEN": "Yunfu"},
    "Chaozhou": {
        "cityName": "潮州",
        "cityEN": "Chaozhou",
        "townID": "CHGD140000",
        "townName": "潮州",
        "townEN": "Chaozhou"
    },
    "潮州": {"cityName": "潮州", "cityEN": "Chaozhou", "townID": "CHGD140000", "townName": "潮州", "townEN": "Chaozhou"},
    "Dongguan": {
        "cityName": "东莞",
        "cityEN": "Dongguan",
        "townID": "CHGD150000",
        "townName": "东莞",
        "townEN": "Dongguan"
    },
    "东莞": {"cityName": "东莞", "cityEN": "Dongguan", "townID": "CHGD150000", "townName": "东莞", "townEN": "Dongguan"},
    "Zhongshan": {
        "cityName": "中山",
        "cityEN": "Zhongshan",
        "townID": "CHGD160000",
        "townName": "中山",
        "townEN": "Zhongshan"
    },
    "中山": {"cityName": "中山", "cityEN": "Zhongshan", "townID": "CHGD160000", "townName": "中山", "townEN": "Zhongshan"},
    "Yangjiang": {
        "cityName": "阳江",
        "cityEN": "Yangjiang",
        "townID": "CHGD170000",
        "townName": "阳江",
        "townEN": "Yangjiang"
    },
    "阳江": {"cityName": "阳江", "cityEN": "Yangjiang", "townID": "CHGD170000", "townName": "阳江", "townEN": "Yangjiang"},
    "Jieyang": {"cityName": "揭阳", "cityEN": "Jieyang", "townID": "CHGD180000", "townName": "揭阳", "townEN": "Jieyang"},
    "揭阳": {"cityName": "揭阳", "cityEN": "Jieyang", "townID": "CHGD180000", "townName": "揭阳", "townEN": "Jieyang"},
    "Maoming": {"cityName": "茂名", "cityEN": "Maoming", "townID": "CHGD190000", "townName": "茂名", "townEN": "Maoming"},
    "茂名": {"cityName": "茂名", "cityEN": "Maoming", "townID": "CHGD190000", "townName": "茂名", "townEN": "Maoming"},
    "Shanwei": {"cityName": "汕尾", "cityEN": "Shanwei", "townID": "CHGD200000", "townName": "汕尾", "townEN": "Shanwei"},
    "汕尾": {"cityName": "汕尾", "cityEN": "Shanwei", "townID": "CHGD200000", "townName": "汕尾", "townEN": "Shanwei"},
    "Nanning": {"cityName": "南宁", "cityEN": "Nanning", "townID": "CHGX000000", "townName": "南宁", "townEN": "Nanning"},
    "南宁": {"cityName": "南宁", "cityEN": "Nanning", "townID": "CHGX000000", "townName": "南宁", "townEN": "Nanning"},
    "Chongzuo": {
        "cityName": "崇左",
        "cityEN": "Chongzuo",
        "townID": "CHGX010000",
        "townName": "崇左",
        "townEN": "Chongzuo"
    },
    "崇左": {"cityName": "崇左", "cityEN": "Chongzuo", "townID": "CHGX010000", "townName": "崇左", "townEN": "Chongzuo"},
    "Liuzhou": {"cityName": "柳州", "cityEN": "Liuzhou", "townID": "CHGX020000", "townName": "柳州", "townEN": "Liuzhou"},
    "柳州": {"cityName": "柳州", "cityEN": "Liuzhou", "townID": "CHGX020000", "townName": "柳州", "townEN": "Liuzhou"},
    "Laibin": {"cityName": "来宾", "cityEN": "Laibin", "townID": "CHGX030000", "townName": "来宾", "townEN": "Laibin"},
    "来宾": {"cityName": "来宾", "cityEN": "Laibin", "townID": "CHGX030000", "townName": "来宾", "townEN": "Laibin"},
    "Guilin": {"cityName": "桂林", "cityEN": "Guilin", "townID": "CHGX040000", "townName": "桂林", "townEN": "Guilin"},
    "桂林": {"cityName": "桂林", "cityEN": "Guilin", "townID": "CHGX040000", "townName": "桂林", "townEN": "Guilin"},
    "Wuzhou": {"cityName": "梧州", "cityEN": "Wuzhou", "townID": "CHGX050000", "townName": "梧州", "townEN": "Wuzhou"},
    "梧州": {"cityName": "梧州", "cityEN": "Wuzhou", "townID": "CHGX050000", "townName": "梧州", "townEN": "Wuzhou"},
    "Hezhou": {"cityName": "贺州", "cityEN": "Hezhou", "townID": "CHGX060000", "townName": "贺州", "townEN": "Hezhou"},
    "贺州": {"cityName": "贺州", "cityEN": "Hezhou", "townID": "CHGX060000", "townName": "贺州", "townEN": "Hezhou"},
    "Guigang": {"cityName": "贵港", "cityEN": "Guigang", "townID": "CHGX070000", "townName": "贵港", "townEN": "Guigang"},
    "贵港": {"cityName": "贵港", "cityEN": "Guigang", "townID": "CHGX070000", "townName": "贵港", "townEN": "Guigang"},
    "Yulin": {"cityName": "玉林", "cityEN": "Yulin", "townID": "CHGX080000", "townName": "玉林", "townEN": "Yulin"},
    "玉林": {"cityName": "玉林", "cityEN": "Yulin", "townID": "CHGX080000", "townName": "玉林", "townEN": "Yulin"},
    "Baise": {"cityName": "百色", "cityEN": "Baise", "townID": "CHGX090000", "townName": "百色", "townEN": "Baise"},
    "百色": {"cityName": "百色", "cityEN": "Baise", "townID": "CHGX090000", "townName": "百色", "townEN": "Baise"},
    "Qinzhou": {"cityName": "钦州", "cityEN": "Qinzhou", "townID": "CHGX100000", "townName": "钦州", "townEN": "Qinzhou"},
    "钦州": {"cityName": "钦州", "cityEN": "Qinzhou", "townID": "CHGX100000", "townName": "钦州", "townEN": "Qinzhou"},
    "Hechi": {"cityName": "河池", "cityEN": "Hechi", "townID": "CHGX110000", "townName": "河池", "townEN": "Hechi"},
    "河池": {"cityName": "河池", "cityEN": "Hechi", "townID": "CHGX110000", "townName": "河池", "townEN": "Hechi"},
    "Beihai": {"cityName": "北海", "cityEN": "Beihai", "townID": "CHGX120000", "townName": "北海", "townEN": "Beihai"},
    "北海": {"cityName": "北海", "cityEN": "Beihai", "townID": "CHGX120000", "townName": "北海", "townEN": "Beihai"},
    "Fangchenggang": {
        "cityName": "防城港",
        "cityEN": "Fangchenggang",
        "townID": "CHGX130000",
        "townName": "防城港",
        "townEN": "Fangchenggang"
    },
    "防城港": {
        "cityName": "防城港",
        "cityEN": "Fangchenggang",
        "townID": "CHGX130000",
        "townName": "防城港",
        "townEN": "Fangchenggang"
    },
    "Haikou": {"cityName": "海口", "cityEN": "Haikou", "townID": "CHHI000000", "townName": "海口", "townEN": "Haikou"},
    "海口": {"cityName": "海口", "cityEN": "Haikou", "townID": "CHHI000000", "townName": "海口", "townEN": "Haikou"},
    "Sanya": {"cityName": "三亚", "cityEN": "Sanya", "townID": "CHHI010000", "townName": "三亚", "townEN": "Sanya"},
    "三亚": {"cityName": "三亚", "cityEN": "Sanya", "townID": "CHHI010000", "townName": "三亚", "townEN": "Sanya"},
    "Dongfang": {
        "cityName": "东方",
        "cityEN": "Dongfang",
        "townID": "CHHI020000",
        "townName": "东方",
        "townEN": "Dongfang"
    },
    "东方": {"cityName": "东方", "cityEN": "Dongfang", "townID": "CHHI020000", "townName": "东方", "townEN": "Dongfang"},
    "Lingao": {"cityName": "临高", "cityEN": "Lingao", "townID": "CHHI030000", "townName": "临高", "townEN": "Lingao"},
    "临高": {"cityName": "临高", "cityEN": "Lingao", "townID": "CHHI030000", "townName": "临高", "townEN": "Lingao"},
    "Chengmai": {
        "cityName": "澄迈",
        "cityEN": "Chengmai",
        "townID": "CHHI040000",
        "townName": "澄迈",
        "townEN": "Chengmai"
    },
    "澄迈": {"cityName": "澄迈", "cityEN": "Chengmai", "townID": "CHHI040000", "townName": "澄迈", "townEN": "Chengmai"},
    "Danzhou": {"cityName": "儋州", "cityEN": "Danzhou", "townID": "CHHI050000", "townName": "儋州", "townEN": "Danzhou"},
    "儋州": {"cityName": "儋州", "cityEN": "Danzhou", "townID": "CHHI050000", "townName": "儋州", "townEN": "Danzhou"},
    "Changjiang": {
        "cityName": "昌江",
        "cityEN": "Changjiang",
        "townID": "CHHI060000",
        "townName": "昌江",
        "townEN": "Changjiang"
    },
    "昌江": {"cityName": "昌江", "cityEN": "Changjiang", "townID": "CHHI060000", "townName": "昌江", "townEN": "Changjiang"},
    "Baisha": {"cityName": "白沙", "cityEN": "Baisha", "townID": "CHHI070000", "townName": "白沙", "townEN": "Baisha"},
    "白沙": {"cityName": "白沙", "cityEN": "Baisha", "townID": "CHHI070000", "townName": "白沙", "townEN": "Baisha"},
    "Qiongzhong": {
        "cityName": "琼中",
        "cityEN": "Qiongzhong",
        "townID": "CHHI080000",
        "townName": "琼中",
        "townEN": "Qiongzhong"
    },
    "琼中": {"cityName": "琼中", "cityEN": "Qiongzhong", "townID": "CHHI080000", "townName": "琼中", "townEN": "Qiongzhong"},
    "Dingan": {"cityName": "定安", "cityEN": "Dingan", "townID": "CHHI090000", "townName": "定安", "townEN": "Dingan"},
    "定安": {"cityName": "定安", "cityEN": "Dingan", "townID": "CHHI090000", "townName": "定安", "townEN": "Dingan"},
    "Tunchang": {
        "cityName": "屯昌",
        "cityEN": "Tunchang",
        "townID": "CHHI100000",
        "townName": "屯昌",
        "townEN": "Tunchang"
    },
    "屯昌": {"cityName": "屯昌", "cityEN": "Tunchang", "townID": "CHHI100000", "townName": "屯昌", "townEN": "Tunchang"},
    "Qionghai": {
        "cityName": "琼海",
        "cityEN": "Qionghai",
        "townID": "CHHI110000",
        "townName": "琼海",
        "townEN": "Qionghai"
    },
    "琼海": {"cityName": "琼海", "cityEN": "Qionghai", "townID": "CHHI110000", "townName": "琼海", "townEN": "Qionghai"},
    "Wenchang": {
        "cityName": "文昌",
        "cityEN": "Wenchang",
        "townID": "CHHI120000",
        "townName": "文昌",
        "townEN": "Wenchang"
    },
    "文昌": {"cityName": "文昌", "cityEN": "Wenchang", "townID": "CHHI120000", "townName": "文昌", "townEN": "Wenchang"},
    "Baoting": {"cityName": "保亭", "cityEN": "Baoting", "townID": "CHHI130000", "townName": "保亭", "townEN": "Baoting"},
    "保亭": {"cityName": "保亭", "cityEN": "Baoting", "townID": "CHHI130000", "townName": "保亭", "townEN": "Baoting"},
    "Wanning": {"cityName": "万宁", "cityEN": "Wanning", "townID": "CHHI140000", "townName": "万宁", "townEN": "Wanning"},
    "万宁": {"cityName": "万宁", "cityEN": "Wanning", "townID": "CHHI140000", "townName": "万宁", "townEN": "Wanning"},
    "Lingshui": {
        "cityName": "陵水",
        "cityEN": "Lingshui",
        "townID": "CHHI150000",
        "townName": "陵水",
        "townEN": "Lingshui"
    },
    "陵水": {"cityName": "陵水", "cityEN": "Lingshui", "townID": "CHHI150000", "townName": "陵水", "townEN": "Lingshui"},
    "Xisha": {"cityName": "西沙", "cityEN": "Xisha", "townID": "CHHI160000", "townName": "西沙", "townEN": "Xisha"},
    "西沙": {"cityName": "西沙", "cityEN": "Xisha", "townID": "CHHI160000", "townName": "西沙", "townEN": "Xisha"},
    "Nansha": {"cityName": "南沙", "cityEN": "Nansha", "townID": "CHHI170000", "townName": "南沙", "townEN": "Nansha"},
    "南沙": {"cityName": "南沙", "cityEN": "Nansha", "townID": "CHHI170000", "townName": "南沙", "townEN": "Nansha"},
    "Ledong": {"cityName": "乐东", "cityEN": "Ledong", "townID": "CHHI180000", "townName": "乐东", "townEN": "Ledong"},
    "乐东": {"cityName": "乐东", "cityEN": "Ledong", "townID": "CHHI180000", "townName": "乐东", "townEN": "Ledong"},
    "Wuzhishan": {
        "cityName": "五指山",
        "cityEN": "Wuzhishan",
        "townID": "CHHI190000",
        "townName": "五指山",
        "townEN": "Wuzhishan"
    },
    "五指山": {"cityName": "五指山", "cityEN": "Wuzhishan", "townID": "CHHI190000", "townName": "五指山", "townEN": "Wuzhishan"},
    "Zhongsha": {
        "cityName": "中沙",
        "cityEN": "Zhongsha",
        "townID": "CHHI200000",
        "townName": "中沙",
        "townEN": "Wuzhishan"
    },
    "中沙": {"cityName": "中沙", "cityEN": "Zhongsha", "townID": "CHHI200000", "townName": "中沙", "townEN": "Wuzhishan"},
    "Guiyang": {"cityName": "贵阳", "cityEN": "Guiyang", "townID": "CHGZ000000", "townName": "贵阳", "townEN": "Guiyang"},
    "贵阳": {"cityName": "贵阳", "cityEN": "Guiyang", "townID": "CHGZ000000", "townName": "贵阳", "townEN": "Guiyang"},
    "Zunyi": {"cityName": "遵义", "cityEN": "Zunyi", "townID": "CHGZ010000", "townName": "遵义", "townEN": "Zunyi"},
    "遵义": {"cityName": "遵义", "cityEN": "Zunyi", "townID": "CHGZ010000", "townName": "遵义", "townEN": "Zunyi"},
    "Anshun": {"cityName": "安顺", "cityEN": "Anshun", "townID": "CHGZ020000", "townName": "安顺", "townEN": "Anshun"},
    "安顺": {"cityName": "安顺", "cityEN": "Anshun", "townID": "CHGZ020000", "townName": "安顺", "townEN": "Anshun"},
    "Qiannan": {"cityName": "黔南", "cityEN": "Qiannan", "townID": "CHGZ030000", "townName": "都匀", "townEN": "Duyun"},
    "黔南": {"cityName": "黔南", "cityEN": "Qiannan", "townID": "CHGZ030000", "townName": "都匀", "townEN": "Duyun"},
    "Qiandongnan": {
        "cityName": "黔东南",
        "cityEN": "Qiandongnan",
        "townID": "CHGZ040000",
        "townName": "凯里",
        "townEN": "Kaili"
    },
    "黔东南": {"cityName": "黔东南", "cityEN": "Qiandongnan", "townID": "CHGZ040000", "townName": "凯里", "townEN": "Kaili"},
    "Tongren": {"cityName": "铜仁", "cityEN": "Tongren", "townID": "CHGZ050000", "townName": "铜仁", "townEN": "Tongren"},
    "铜仁": {"cityName": "铜仁", "cityEN": "Tongren", "townID": "CHGZ050000", "townName": "铜仁", "townEN": "Tongren"},
    "Bijie": {"cityName": "毕节", "cityEN": "Bijie", "townID": "CHGZ060000", "townName": "毕节", "townEN": "Bijie"},
    "毕节": {"cityName": "毕节", "cityEN": "Bijie", "townID": "CHGZ060000", "townName": "毕节", "townEN": "Bijie"},
    "Liupanshui": {
        "cityName": "六盘水",
        "cityEN": "Liupanshui",
        "townID": "CHGZ070000",
        "townName": "水城",
        "townEN": "Shuicheng"
    },
    "六盘水": {"cityName": "六盘水", "cityEN": "Liupanshui", "townID": "CHGZ070000", "townName": "水城", "townEN": "Shuicheng"},
    "Qianxinan": {
        "cityName": "黔西南",
        "cityEN": "Qianxinan",
        "townID": "CHGZ080000",
        "townName": "兴义",
        "townEN": "Xingyi"
    },
    "黔西南": {"cityName": "黔西南", "cityEN": "Qianxinan", "townID": "CHGZ080000", "townName": "兴义", "townEN": "Xingyi"},
    "Kunming": {"cityName": "昆明", "cityEN": "Kunming", "townID": "CHYN000000", "townName": "昆明", "townEN": "Kunming"},
    "昆明": {"cityName": "昆明", "cityEN": "Kunming", "townID": "CHYN000000", "townName": "昆明", "townEN": "Kunming"},
    "Dali": {"cityName": "大理", "cityEN": "Dali", "townID": "CHYN010000", "townName": "大理", "townEN": "Dali"},
    "大理": {"cityName": "大理", "cityEN": "Dali", "townID": "CHYN010000", "townName": "大理", "townEN": "Dali"},
    "Honghe": {"cityName": "红河", "cityEN": "Honghe", "townID": "CHYN020000", "townName": "红河", "townEN": "Honghe"},
    "红河": {"cityName": "红河", "cityEN": "Honghe", "townID": "CHYN020000", "townName": "红河", "townEN": "Honghe"},
    "Qujing": {"cityName": "曲靖", "cityEN": "Qujing", "townID": "CHYN030000", "townName": "曲靖", "townEN": "Qujing"},
    "曲靖": {"cityName": "曲靖", "cityEN": "Qujing", "townID": "CHYN030000", "townName": "曲靖", "townEN": "Qujing"},
    "Baoshan": {"cityName": "保山", "cityEN": "Baoshan", "townID": "CHYN040000", "townName": "保山", "townEN": "Baoshan"},
    "保山": {"cityName": "保山", "cityEN": "Baoshan", "townID": "CHYN040000", "townName": "保山", "townEN": "Baoshan"},
    "Wenshan": {"cityName": "文山", "cityEN": "Wenshan", "townID": "CHYN050000", "townName": "文山", "townEN": "Wenshan"},
    "文山": {"cityName": "文山", "cityEN": "Wenshan", "townID": "CHYN050000", "townName": "文山", "townEN": "Wenshan"},
    "Yuxi": {"cityName": "玉溪", "cityEN": "Yuxi", "townID": "CHYN060000", "townName": "玉溪", "townEN": "Yuxi"},
    "玉溪": {"cityName": "玉溪", "cityEN": "Yuxi", "townID": "CHYN060000", "townName": "玉溪", "townEN": "Yuxi"},
    "Chuxiong": {
        "cityName": "楚雄",
        "cityEN": "Chuxiong",
        "townID": "CHYN070000",
        "townName": "楚雄",
        "townEN": "Chuxiong"
    },
    "楚雄": {"cityName": "楚雄", "cityEN": "Chuxiong", "townID": "CHYN070000", "townName": "楚雄", "townEN": "Chuxiong"},
    "Puer": {"cityName": "普洱", "cityEN": "Puer", "townID": "CHYN080000", "townName": "普洱", "townEN": "Puer"},
    "普洱": {"cityName": "普洱", "cityEN": "Puer", "townID": "CHYN080000", "townName": "普洱", "townEN": "Puer"},
    "Zhaotong": {
        "cityName": "昭通",
        "cityEN": "Zhaotong",
        "townID": "CHYN090000",
        "townName": "昭通",
        "townEN": "Zhaotong"
    },
    "昭通": {"cityName": "昭通", "cityEN": "Zhaotong", "townID": "CHYN090000", "townName": "昭通", "townEN": "Zhaotong"},
    "Lincang": {"cityName": "临沧", "cityEN": "Lincang", "townID": "CHYN100000", "townName": "临沧", "townEN": "Lincang"},
    "临沧": {"cityName": "临沧", "cityEN": "Lincang", "townID": "CHYN100000", "townName": "临沧", "townEN": "Lincang"},
    "Nujiang": {"cityName": "怒江", "cityEN": "Nujiang", "townID": "CHYN110000", "townName": "怒江", "townEN": "Nujiang"},
    "怒江": {"cityName": "怒江", "cityEN": "Nujiang", "townID": "CHYN110000", "townName": "怒江", "townEN": "Nujiang"},
    "Diqing": {
        "cityName": "迪庆",
        "cityEN": "Diqing",
        "townID": "CHYN120000",
        "townName": "香格里拉",
        "townEN": "Xianggelila"
    },
    "迪庆": {"cityName": "迪庆", "cityEN": "Diqing", "townID": "CHYN120000", "townName": "香格里拉", "townEN": "Xianggelila"},
    "Lijiang": {"cityName": "丽江", "cityEN": "Lijiang", "townID": "CHYN130000", "townName": "丽江", "townEN": "Lijiang"},
    "丽江": {"cityName": "丽江", "cityEN": "Lijiang", "townID": "CHYN130000", "townName": "丽江", "townEN": "Lijiang"},
    "Dehong": {"cityName": "德宏", "cityEN": "Dehong", "townID": "CHYN140000", "townName": "德宏", "townEN": "Dehong"},
    "德宏": {"cityName": "德宏", "cityEN": "Dehong", "townID": "CHYN140000", "townName": "德宏", "townEN": "Dehong"},
    "Xishuangbanna": {
        "cityName": "西双版纳",
        "cityEN": "Xishuangbanna",
        "townID": "CHYN150000",
        "townName": "景洪",
        "townEN": "Jinghong"
    },
    "西双版纳": {
        "cityName": "西双版纳",
        "cityEN": "Xishuangbanna",
        "townID": "CHYN150000",
        "townName": "景洪",
        "townEN": "Jinghong"
    },
    "Chengdu": {"cityName": "成都", "cityEN": "Chengdu", "townID": "CHSC000000", "townName": "成都", "townEN": "Chengdu"},
    "成都": {"cityName": "成都", "cityEN": "Chengdu", "townID": "CHSC000000", "townName": "成都", "townEN": "Chengdu"},
    "Panzhihua": {
        "cityName": "攀枝花",
        "cityEN": "Panzhihua",
        "townID": "CHSC010000",
        "townName": "攀枝花",
        "townEN": "Panzhihua"
    },
    "攀枝花": {"cityName": "攀枝花", "cityEN": "Panzhihua", "townID": "CHSC010000", "townName": "攀枝花", "townEN": "Panzhihua"},
    "Zigong": {"cityName": "自贡", "cityEN": "Zigong", "townID": "CHSC020000", "townName": "自贡", "townEN": "Zigong"},
    "自贡": {"cityName": "自贡", "cityEN": "Zigong", "townID": "CHSC020000", "townName": "自贡", "townEN": "Zigong"},
    "Mianyang": {
        "cityName": "绵阳",
        "cityEN": "Mianyang",
        "townID": "CHSC030000",
        "townName": "绵阳",
        "townEN": "Mianyang"
    },
    "绵阳": {"cityName": "绵阳", "cityEN": "Mianyang", "townID": "CHSC030000", "townName": "绵阳", "townEN": "Mianyang"},
    "Nanchong": {
        "cityName": "南充",
        "cityEN": "Nanchong",
        "townID": "CHSC040000",
        "townName": "南充",
        "townEN": "Nanchong"
    },
    "南充": {"cityName": "南充", "cityEN": "Nanchong", "townID": "CHSC040000", "townName": "南充", "townEN": "Nanchong"},
    "Dazhou": {"cityName": "达州", "cityEN": "Dazhou", "townID": "CHSC050000", "townName": "达州", "townEN": "Dazhou"},
    "达州": {"cityName": "达州", "cityEN": "Dazhou", "townID": "CHSC050000", "townName": "达州", "townEN": "Dazhou"},
    "Suining": {"cityName": "遂宁", "cityEN": "Suining", "townID": "CHSC060000", "townName": "遂宁", "townEN": "Suining"},
    "遂宁": {"cityName": "遂宁", "cityEN": "Suining", "townID": "CHSC060000", "townName": "遂宁", "townEN": "Suining"},
    "Guangan": {"cityName": "广安", "cityEN": "Guangan", "townID": "CHSC070000", "townName": "广安", "townEN": "Guangan"},
    "广安": {"cityName": "广安", "cityEN": "Guangan", "townID": "CHSC070000", "townName": "广安", "townEN": "Guangan"},
    "Bazhong": {"cityName": "巴中", "cityEN": "Bazhong", "townID": "CHSC080000", "townName": "巴中", "townEN": "Bazhong"},
    "巴中": {"cityName": "巴中", "cityEN": "Bazhong", "townID": "CHSC080000", "townName": "巴中", "townEN": "Bazhong"},
    "Luzhou": {"cityName": "泸州", "cityEN": "Luzhou", "townID": "CHSC090000", "townName": "泸州", "townEN": "Luzhou"},
    "泸州": {"cityName": "泸州", "cityEN": "Luzhou", "townID": "CHSC090000", "townName": "泸州", "townEN": "Luzhou"},
    "Yibin": {"cityName": "宜宾", "cityEN": "Yibin", "townID": "CHSC100000", "townName": "宜宾", "townEN": "Yibin"},
    "宜宾": {"cityName": "宜宾", "cityEN": "Yibin", "townID": "CHSC100000", "townName": "宜宾", "townEN": "Yibin"},
    "Neijiang": {
        "cityName": "内江",
        "cityEN": "Neijiang",
        "townID": "CHSC110000",
        "townName": "内江",
        "townEN": "Neijiang"
    },
    "内江": {"cityName": "内江", "cityEN": "Neijiang", "townID": "CHSC110000", "townName": "内江", "townEN": "Neijiang"},
    "Ziyang": {"cityName": "资阳", "cityEN": "Ziyang", "townID": "CHSC120000", "townName": "资阳", "townEN": "Ziyang"},
    "资阳": {"cityName": "资阳", "cityEN": "Ziyang", "townID": "CHSC120000", "townName": "资阳", "townEN": "Ziyang"},
    "Leshan": {"cityName": "乐山", "cityEN": "Leshan", "townID": "CHSC130000", "townName": "乐山", "townEN": "Leshan"},
    "乐山": {"cityName": "乐山", "cityEN": "Leshan", "townID": "CHSC130000", "townName": "乐山", "townEN": "Leshan"},
    "Meishan": {"cityName": "眉山", "cityEN": "Meishan", "townID": "CHSC140000", "townName": "眉山", "townEN": "Meishan"},
    "眉山": {"cityName": "眉山", "cityEN": "Meishan", "townID": "CHSC140000", "townName": "眉山", "townEN": "Meishan"},
    "Liangshan": {
        "cityName": "凉山",
        "cityEN": "Liangshan",
        "townID": "CHSC150000",
        "townName": "凉山",
        "townEN": "Liangshan"
    },
    "凉山": {"cityName": "凉山", "cityEN": "Liangshan", "townID": "CHSC150000", "townName": "凉山", "townEN": "Liangshan"},
    "Yaan": {"cityName": "雅安", "cityEN": "Yaan", "townID": "CHSC160000", "townName": "雅安", "townEN": "Yaan"},
    "雅安": {"cityName": "雅安", "cityEN": "Yaan", "townID": "CHSC160000", "townName": "雅安", "townEN": "Yaan"},
    "Ganzi": {"cityName": "甘孜", "cityEN": "Ganzi", "townID": "CHSC170000", "townName": "甘孜", "townEN": "Ganzi"},
    "甘孜": {"cityName": "甘孜", "cityEN": "Ganzi", "townID": "CHSC170000", "townName": "甘孜", "townEN": "Ganzi"},
    "Aba": {"cityName": "阿坝", "cityEN": "Aba", "townID": "CHSC180000", "townName": "阿坝", "townEN": "Aba"},
    "阿坝": {"cityName": "阿坝", "cityEN": "Aba", "townID": "CHSC180000", "townName": "阿坝", "townEN": "Aba"},
    "Deyang": {"cityName": "德阳", "cityEN": "Deyang", "townID": "CHSC190000", "townName": "德阳", "townEN": "Deyang"},
    "德阳": {"cityName": "德阳", "cityEN": "Deyang", "townID": "CHSC190000", "townName": "德阳", "townEN": "Deyang"},
    "Guangyuan": {
        "cityName": "广元",
        "cityEN": "Guangyuan",
        "townID": "CHSC200000",
        "townName": "广元",
        "townEN": "Guangyuan"
    },
    "广元": {"cityName": "广元", "cityEN": "Guangyuan", "townID": "CHSC200000", "townName": "广元", "townEN": "Guangyuan"},
    "Lasa": {"cityName": "拉萨", "cityEN": "Lasa", "townID": "CHXZ000000", "townName": "拉萨", "townEN": "Lasa"},
    "拉萨": {"cityName": "拉萨", "cityEN": "Lasa", "townID": "CHXZ000000", "townName": "拉萨", "townEN": "Lasa"},
    "Rikaze": {"cityName": "日喀则", "cityEN": "Rikaze", "townID": "CHXZ010000", "townName": "日喀则", "townEN": "Rikaze"},
    "日喀则": {"cityName": "日喀则", "cityEN": "Rikaze", "townID": "CHXZ010000", "townName": "日喀则", "townEN": "Rikaze"},
    "Shannan": {"cityName": "山南", "cityEN": "Shannan", "townID": "CHXZ020000", "townName": "山南", "townEN": "Shannan"},
    "山南": {"cityName": "山南", "cityEN": "Shannan", "townID": "CHXZ020000", "townName": "山南", "townEN": "Shannan"},
    "Linzhi": {"cityName": "林芝", "cityEN": "Linzhi", "townID": "CHXZ030000", "townName": "林芝", "townEN": "Linzhi"},
    "林芝": {"cityName": "林芝", "cityEN": "Linzhi", "townID": "CHXZ030000", "townName": "林芝", "townEN": "Linzhi"},
    "Changdu": {"cityName": "昌都", "cityEN": "Changdu", "townID": "CHXZ040000", "townName": "昌都", "townEN": "Changdu"},
    "昌都": {"cityName": "昌都", "cityEN": "Changdu", "townID": "CHXZ040000", "townName": "昌都", "townEN": "Changdu"},
    "Naqu": {"cityName": "那曲", "cityEN": "Naqu", "townID": "CHXZ050000", "townName": "那曲", "townEN": "Naqu"},
    "那曲": {"cityName": "那曲", "cityEN": "Naqu", "townID": "CHXZ050000", "townName": "那曲", "townEN": "Naqu"},
    "Ali": {"cityName": "阿里", "cityEN": "Ali", "townID": "CHXZ060000", "townName": "阿里", "townEN": "Ali"},
    "阿里": {"cityName": "阿里", "cityEN": "Ali", "townID": "CHXZ060000", "townName": "阿里", "townEN": "Ali"},
    "Xian": {"cityName": "西安", "cityEN": "Xian", "townID": "CHSN000000", "townName": "西安", "townEN": "Xian"},
    "西安": {"cityName": "西安", "cityEN": "Xian", "townID": "CHSN000000", "townName": "西安", "townEN": "Xian"},
    "Xianyang": {
        "cityName": "咸阳",
        "cityEN": "Xianyang",
        "townID": "CHSN010000",
        "townName": "咸阳",
        "townEN": "Xianyang"
    },
    "咸阳": {"cityName": "咸阳", "cityEN": "Xianyang", "townID": "CHSN010000", "townName": "咸阳", "townEN": "Xianyang"},
    "Yanan": {"cityName": "延安", "cityEN": "Yanan", "townID": "CHSN020000", "townName": "延安", "townEN": "Yanan"},
    "延安": {"cityName": "延安", "cityEN": "Yanan", "townID": "CHSN020000", "townName": "延安", "townEN": "Yanan"},
    "Weinan": {"cityName": "渭南", "cityEN": "Weinan", "townID": "CHSN040000", "townName": "渭南", "townEN": "Weinan"},
    "渭南": {"cityName": "渭南", "cityEN": "Weinan", "townID": "CHSN040000", "townName": "渭南", "townEN": "Weinan"},
    "Shangluo": {
        "cityName": "商洛",
        "cityEN": "Shangluo",
        "townID": "CHSN050000",
        "townName": "商洛",
        "townEN": "Shangluo"
    },
    "商洛": {"cityName": "商洛", "cityEN": "Shangluo", "townID": "CHSN050000", "townName": "商洛", "townEN": "Shangluo"},
    "Ankang": {"cityName": "安康", "cityEN": "Ankang", "townID": "CHSN060000", "townName": "安康", "townEN": "Ankang"},
    "安康": {"cityName": "安康", "cityEN": "Ankang", "townID": "CHSN060000", "townName": "安康", "townEN": "Ankang"},
    "Hanzhong": {
        "cityName": "汉中",
        "cityEN": "Hanzhong",
        "townID": "CHSN070000",
        "townName": "汉中",
        "townEN": "Hanzhong"
    },
    "汉中": {"cityName": "汉中", "cityEN": "Hanzhong", "townID": "CHSN070000", "townName": "汉中", "townEN": "Hanzhong"},
    "Baoji": {"cityName": "宝鸡", "cityEN": "Baoji", "townID": "CHSN080000", "townName": "宝鸡", "townEN": "Baoji"},
    "宝鸡": {"cityName": "宝鸡", "cityEN": "Baoji", "townID": "CHSN080000", "townName": "宝鸡", "townEN": "Baoji"},
    "Tongchuan": {
        "cityName": "铜川",
        "cityEN": "Tongchuan",
        "townID": "CHSN090000",
        "townName": "铜川",
        "townEN": "Tongchuan"
    },
    "铜川": {"cityName": "铜川", "cityEN": "Tongchuan", "townID": "CHSN090000", "townName": "铜川", "townEN": "Tongchuan"},
    "Yangling": {
        "cityName": "杨凌",
        "cityEN": "Yangling",
        "townID": "CHSN100000",
        "townName": "杨凌",
        "townEN": "Yangling"
    },
    "杨凌": {"cityName": "杨凌", "cityEN": "Yangling", "townID": "CHSN100000", "townName": "杨凌", "townEN": "Yangling"},
    "Yinchuan": {
        "cityName": "银川",
        "cityEN": "Yinchuan",
        "townID": "CHNX000000",
        "townName": "银川",
        "townEN": "Yinchuan"
    },
    "银川": {"cityName": "银川", "cityEN": "Yinchuan", "townID": "CHNX000000", "townName": "银川", "townEN": "Yinchuan"},
    "Shizuishan": {
        "cityName": "石嘴山",
        "cityEN": "Shizuishan",
        "townID": "CHNX010000",
        "townName": "石嘴山",
        "townEN": "Shizuishan"
    },
    "石嘴山": {
        "cityName": "石嘴山",
        "cityEN": "Shizuishan",
        "townID": "CHNX010000",
        "townName": "石嘴山",
        "townEN": "Shizuishan"
    },
    "Wuzhong": {"cityName": "吴忠", "cityEN": "Wuzhong", "townID": "CHNX020000", "townName": "吴忠", "townEN": "Wuzhong"},
    "吴忠": {"cityName": "吴忠", "cityEN": "Wuzhong", "townID": "CHNX020000", "townName": "吴忠", "townEN": "Wuzhong"},
    "Guyuan": {"cityName": "固原", "cityEN": "Guyuan", "townID": "CHNX030000", "townName": "固原", "townEN": "Guyuan"},
    "固原": {"cityName": "固原", "cityEN": "Guyuan", "townID": "CHNX030000", "townName": "固原", "townEN": "Guyuan"},
    "Zhongwei": {
        "cityName": "中卫",
        "cityEN": "Zhongwei",
        "townID": "CHNX040000",
        "townName": "中卫",
        "townEN": "Zhongwei"
    },
    "中卫": {"cityName": "中卫", "cityEN": "Zhongwei", "townID": "CHNX040000", "townName": "中卫", "townEN": "Zhongwei"},
    "Lanzhou": {"cityName": "兰州", "cityEN": "Lanzhou", "townID": "CHGS000000", "townName": "兰州", "townEN": "Lanzhou"},
    "兰州": {"cityName": "兰州", "cityEN": "Lanzhou", "townID": "CHGS000000", "townName": "兰州", "townEN": "Lanzhou"},
    "Dingxi": {"cityName": "定西", "cityEN": "Dingxi", "townID": "CHGS010000", "townName": "定西", "townEN": "Dingxi"},
    "定西": {"cityName": "定西", "cityEN": "Dingxi", "townID": "CHGS010000", "townName": "定西", "townEN": "Dingxi"},
    "Pingliang": {
        "cityName": "平凉",
        "cityEN": "Pingliang",
        "townID": "CHGS020000",
        "townName": "平凉",
        "townEN": "Pingliang"
    },
    "平凉": {"cityName": "平凉", "cityEN": "Pingliang", "townID": "CHGS020000", "townName": "平凉", "townEN": "Pingliang"},
    "Qingyang": {
        "cityName": "庆阳",
        "cityEN": "Qingyang",
        "townID": "CHGS030000",
        "townName": "庆阳",
        "townEN": "Qingyang"
    },
    "庆阳": {"cityName": "庆阳", "cityEN": "Qingyang", "townID": "CHGS030000", "townName": "庆阳", "townEN": "Qingyang"},
    "Wuwei": {"cityName": "武威", "cityEN": "Wuwei", "townID": "CHGS040000", "townName": "武威", "townEN": "Wuwei"},
    "武威": {"cityName": "武威", "cityEN": "Wuwei", "townID": "CHGS040000", "townName": "武威", "townEN": "Wuwei"},
    "Jinchang": {
        "cityName": "金昌",
        "cityEN": "Jinchang",
        "townID": "CHGS050000",
        "townName": "金昌",
        "townEN": "Jinchang"
    },
    "金昌": {"cityName": "金昌", "cityEN": "Jinchang", "townID": "CHGS050000", "townName": "金昌", "townEN": "Jinchang"},
    "Zhangye": {"cityName": "张掖", "cityEN": "Zhangye", "townID": "CHGS060000", "townName": "张掖", "townEN": "Zhangye"},
    "张掖": {"cityName": "张掖", "cityEN": "Zhangye", "townID": "CHGS060000", "townName": "张掖", "townEN": "Zhangye"},
    "Jiuquan": {"cityName": "酒泉", "cityEN": "Jiuquan", "townID": "CHGS070000", "townName": "酒泉", "townEN": "Jiuquan"},
    "酒泉": {"cityName": "酒泉", "cityEN": "Jiuquan", "townID": "CHGS070000", "townName": "酒泉", "townEN": "Jiuquan"},
    "Tianshui": {
        "cityName": "天水",
        "cityEN": "Tianshui",
        "townID": "CHGS080000",
        "townName": "天水",
        "townEN": "Tianshui"
    },
    "天水": {"cityName": "天水", "cityEN": "Tianshui", "townID": "CHGS080000", "townName": "天水", "townEN": "Tianshui"},
    "Longnan": {"cityName": "陇南", "cityEN": "Longnan", "townID": "CHGS090000", "townName": "武都", "townEN": "Wudu"},
    "陇南": {"cityName": "陇南", "cityEN": "Longnan", "townID": "CHGS090000", "townName": "武都", "townEN": "Wudu"},
    "Linxia": {"cityName": "临夏", "cityEN": "Linxia", "townID": "CHGS100000", "townName": "临夏", "townEN": "Linxia"},
    "临夏": {"cityName": "临夏", "cityEN": "Linxia", "townID": "CHGS100000", "townName": "临夏", "townEN": "Linxia"},
    "Gannan": {"cityName": "甘南", "cityEN": "Gannan", "townID": "CHGS110000", "townName": "合作", "townEN": "Hezuo"},
    "甘南": {"cityName": "甘南", "cityEN": "Gannan", "townID": "CHGS110000", "townName": "合作", "townEN": "Hezuo"},
    "Baiyin": {"cityName": "白银", "cityEN": "Baiyin", "townID": "CHGS120000", "townName": "白银", "townEN": "Baiyin"},
    "白银": {"cityName": "白银", "cityEN": "Baiyin", "townID": "CHGS120000", "townName": "白银", "townEN": "Baiyin"},
    "Jiayuguan": {
        "cityName": "嘉峪关",
        "cityEN": "Jiayuguan",
        "townID": "CHGS130000",
        "townName": "嘉峪关",
        "townEN": "Jiayuguan"
    },
    "嘉峪关": {"cityName": "嘉峪关", "cityEN": "Jiayuguan", "townID": "CHGS130000", "townName": "嘉峪关", "townEN": "Jiayuguan"},
    "Xining": {"cityName": "西宁", "cityEN": "Xining", "townID": "CHQH000000", "townName": "西宁", "townEN": "Xining"},
    "西宁": {"cityName": "西宁", "cityEN": "Xining", "townID": "CHQH000000", "townName": "西宁", "townEN": "Xining"},
    "Haidong": {"cityName": "海东", "cityEN": "Haidong", "townID": "CHQH010000", "townName": "海东", "townEN": "Haidong"},
    "海东": {"cityName": "海东", "cityEN": "Haidong", "townID": "CHQH010000", "townName": "海东", "townEN": "Haidong"},
    "Huangnan": {
        "cityName": "黄南",
        "cityEN": "Huangnan",
        "townID": "CHQH020000",
        "townName": "黄南",
        "townEN": "Huangnan"
    },
    "黄南": {"cityName": "黄南", "cityEN": "Huangnan", "townID": "CHQH020000", "townName": "黄南", "townEN": "Huangnan"},
    "Hainan": {"cityName": "海南", "cityEN": "Hainan", "townID": "CHQH030000", "townName": "海南", "townEN": "Hainan"},
    "海南": {"cityName": "海南", "cityEN": "Hainan", "townID": "CHQH030000", "townName": "海南", "townEN": "Hainan"},
    "Guoluo": {"cityName": "果洛", "cityEN": "Guoluo", "townID": "CHQH040000", "townName": "果洛", "townEN": "Guoluo"},
    "果洛": {"cityName": "果洛", "cityEN": "Guoluo", "townID": "CHQH040000", "townName": "果洛", "townEN": "Guoluo"},
    "Yushu": {"cityName": "玉树", "cityEN": "Yushu", "townID": "CHQH050000", "townName": "玉树", "townEN": "Yushu"},
    "玉树": {"cityName": "玉树", "cityEN": "Yushu", "townID": "CHQH050000", "townName": "玉树", "townEN": "Yushu"},
    "Haixi": {"cityName": "海西", "cityEN": "Haixi", "townID": "CHQH060000", "townName": "海西", "townEN": "Haixi"},
    "海西": {"cityName": "海西", "cityEN": "Haixi", "townID": "CHQH060000", "townName": "海西", "townEN": "Haixi"},
    "Haibei": {"cityName": "海北", "cityEN": "Haibei", "townID": "CHQH070000", "townName": "海北", "townEN": "Haibei"},
    "海北": {"cityName": "海北", "cityEN": "Haibei", "townID": "CHQH070000", "townName": "海北", "townEN": "Haibei"},
    "Geermu": {"cityName": "格尔木", "cityEN": "Geermu", "townID": "CHQH080000", "townName": "格尔木", "townEN": "Geermu"},
    "格尔木": {"cityName": "格尔木", "cityEN": "Geermu", "townID": "CHQH080000", "townName": "格尔木", "townEN": "Geermu"},
    "Wulumuqi": {
        "cityName": "乌鲁木齐",
        "cityEN": "Wulumuqi",
        "townID": "CHXJ000000",
        "townName": "乌鲁木齐",
        "townEN": "Wulumuqi"
    },
    "乌鲁木齐": {
        "cityName": "乌鲁木齐",
        "cityEN": "Wulumuqi",
        "townID": "CHXJ000000",
        "townName": "乌鲁木齐",
        "townEN": "Wulumuqi"
    },
    "Kelamayi": {
        "cityName": "克拉玛依",
        "cityEN": "Kelamayi",
        "townID": "CHXJ010000",
        "townName": "克拉玛依",
        "townEN": "Kelamayi"
    },
    "克拉玛依": {
        "cityName": "克拉玛依",
        "cityEN": "Kelamayi",
        "townID": "CHXJ010000",
        "townName": "克拉玛依",
        "townEN": "Kelamayi"
    },
    "Shihezi": {"cityName": "石河子", "cityEN": "Shihezi", "townID": "CHXJ020000", "townName": "石河子", "townEN": "Shihezi"},
    "石河子": {"cityName": "石河子", "cityEN": "Shihezi", "townID": "CHXJ020000", "townName": "石河子", "townEN": "Shihezi"},
    "Changji": {"cityName": "昌吉", "cityEN": "Changji", "townID": "CHXJ030000", "townName": "昌吉", "townEN": "Changji"},
    "昌吉": {"cityName": "昌吉", "cityEN": "Changji", "townID": "CHXJ030000", "townName": "昌吉", "townEN": "Changji"},
    "Tulufan": {"cityName": "吐鲁番", "cityEN": "Tulufan", "townID": "CHXJ040000", "townName": "吐鲁番", "townEN": "Tulufan"},
    "吐鲁番": {"cityName": "吐鲁番", "cityEN": "Tulufan", "townID": "CHXJ040000", "townName": "吐鲁番", "townEN": "Tulufan"},
    "Bayinguoleng": {
        "cityName": "巴音郭楞",
        "cityEN": "Bayinguoleng",
        "townID": "CHXJ050000",
        "townName": "库尔勒",
        "townEN": "Kuerle"
    },
    "巴音郭楞": {
        "cityName": "巴音郭楞",
        "cityEN": "Bayinguoleng",
        "townID": "CHXJ050000",
        "townName": "库尔勒",
        "townEN": "Kuerle"
    },
    "Alaer": {"cityName": "阿拉尔", "cityEN": "Alaer", "townID": "CHXJ060000", "townName": "阿拉尔", "townEN": "Alaer"},
    "阿拉尔": {"cityName": "阿拉尔", "cityEN": "Alaer", "townID": "CHXJ060000", "townName": "阿拉尔", "townEN": "Alaer"},
    "Akesu": {"cityName": "阿克苏", "cityEN": "Akesu", "townID": "CHXJ070000", "townName": "阿克苏", "townEN": "Akesu"},
    "阿克苏": {"cityName": "阿克苏", "cityEN": "Akesu", "townID": "CHXJ070000", "townName": "阿克苏", "townEN": "Akesu"},
    "Kashi": {"cityName": "喀什", "cityEN": "Kashi", "townID": "CHXJ080000", "townName": "喀什", "townEN": "Kashi"},
    "喀什": {"cityName": "喀什", "cityEN": "Kashi", "townID": "CHXJ080000", "townName": "喀什", "townEN": "Kashi"},
    "Yili": {"cityName": "伊犁", "cityEN": "Yili", "townID": "CHXJ090000", "townName": "伊宁", "townEN": "Yining"},
    "伊犁": {"cityName": "伊犁", "cityEN": "Yili", "townID": "CHXJ090000", "townName": "伊宁", "townEN": "Yining"},
    "Tacheng": {"cityName": "塔城", "cityEN": "Tacheng", "townID": "CHXJ100000", "townName": "塔城", "townEN": "Tacheng"},
    "塔城": {"cityName": "塔城", "cityEN": "Tacheng", "townID": "CHXJ100000", "townName": "塔城", "townEN": "Tacheng"},
    "Hami": {"cityName": "哈密", "cityEN": "Hami", "townID": "CHXJ110000", "townName": "哈密", "townEN": "Hami"},
    "哈密": {"cityName": "哈密", "cityEN": "Hami", "townID": "CHXJ110000", "townName": "哈密", "townEN": "Hami"},
    "Hetian": {"cityName": "和田", "cityEN": "Hetian", "townID": "CHXJ120000", "townName": "和田", "townEN": "Hetian"},
    "和田": {"cityName": "和田", "cityEN": "Hetian", "townID": "CHXJ120000", "townName": "和田", "townEN": "Hetian"},
    "Aletai": {"cityName": "阿勒泰", "cityEN": "Aletai", "townID": "CHXJ130000", "townName": "阿勒泰", "townEN": "Aletai"},
    "阿勒泰": {"cityName": "阿勒泰", "cityEN": "Aletai", "townID": "CHXJ130000", "townName": "阿勒泰", "townEN": "Aletai"},
    "Kezhou": {"cityName": "克州", "cityEN": "Kezhou", "townID": "CHXJ140000", "townName": "阿图什", "townEN": "Atushi"},
    "克州": {"cityName": "克州", "cityEN": "Kezhou", "townID": "CHXJ140000", "townName": "阿图什", "townEN": "Atushi"},
    "Boertala": {"cityName": "博尔塔拉", "cityEN": "Boertala", "townID": "CHXJ150000", "townName": "博乐", "townEN": "Bole"},
    "博尔塔拉": {"cityName": "博尔塔拉", "cityEN": "Boertala", "townID": "CHXJ150000", "townName": "博乐", "townEN": "Bole"},
    "Japan": {"cityName": "日本", "cityEN": "Japan", "townID": "JAXX000000", "townName": "东京", "townEN": "Tokyo"},
    "日本": {"cityName": "日本", "cityEN": "Japan", "townID": "JAXX000000", "townName": "东京", "townEN": "Tokyo"},
    "India": {"cityName": "印度", "cityEN": "India", "townID": "INXX000000", "townName": "新德里", "townEN": "Delhi"},
    "印度": {"cityName": "印度", "cityEN": "India", "townID": "INXX000000", "townName": "新德里", "townEN": "Delhi"},
    "Indonesia": {
        "cityName": "印度尼西亚",
        "cityEN": "Indonesia",
        "townID": "IDXX000000",
        "townName": "雅加达",
        "townEN": "Jakarta"
    },
    "印度尼西亚": {
        "cityName": "印度尼西亚",
        "cityEN": "Indonesia",
        "townID": "IDXX000000",
        "townName": "雅加达",
        "townEN": "Jakarta"
    },
    "Malaysia": {
        "cityName": "马来西亚",
        "cityEN": "Malaysia",
        "townID": "MYXX000000",
        "townName": "吉隆坡",
        "townEN": "Kuala Lumpur"
    },
    "马来西亚": {
        "cityName": "马来西亚",
        "cityEN": "Malaysia",
        "townID": "MYXX000000",
        "townName": "吉隆坡",
        "townEN": "Kuala Lumpur"
    },
    "Kazakhstan": {
        "cityName": "哈萨克斯坦",
        "cityEN": "Kazakhstan",
        "townID": "KZXX000000",
        "townName": "阿斯塔纳",
        "townEN": "Astana"
    },
    "哈萨克斯坦": {
        "cityName": "哈萨克斯坦",
        "cityEN": "Kazakhstan",
        "townID": "KZXX000000",
        "townName": "阿斯塔纳",
        "townEN": "Astana"
    },
    "Saudi Arabia": {
        "cityName": "沙特阿拉伯",
        "cityEN": "Saudi Arabia",
        "townID": "SAXX000000",
        "townName": "利雅得",
        "townEN": "Riyadh"
    },
    "沙特阿拉伯": {
        "cityName": "沙特阿拉伯",
        "cityEN": "Saudi Arabia",
        "townID": "SAXX000000",
        "townName": "利雅得",
        "townEN": "Riyadh"
    },
    "Turkey": {"cityName": "土耳其", "cityEN": "Turkey", "townID": "TUXX000000", "townName": "安卡拉", "townEN": "Ankara"},
    "土耳其": {"cityName": "土耳其", "cityEN": "Turkey", "townID": "TUXX000000", "townName": "安卡拉", "townEN": "Ankara"},
    "Iran": {"cityName": "伊朗", "cityEN": "Iran", "townID": "IRXX000000", "townName": "德黑兰", "townEN": "Tehran"},
    "伊朗": {"cityName": "伊朗", "cityEN": "Iran", "townID": "IRXX000000", "townName": "德黑兰", "townEN": "Tehran"},
    "Pakistan": {
        "cityName": "巴基斯坦",
        "cityEN": "Pakistan",
        "townID": "PKXX000000",
        "townName": "伊斯兰堡",
        "townEN": "Islamabad"
    },
    "巴基斯坦": {
        "cityName": "巴基斯坦",
        "cityEN": "Pakistan",
        "townID": "PKXX000000",
        "townName": "伊斯兰堡",
        "townEN": "Islamabad"
    },
    "Bengal": {"cityName": "孟加拉", "cityEN": "Bengal", "townID": "BGXX000000", "townName": "达卡", "townEN": "Dhaka"},
    "孟加拉": {"cityName": "孟加拉", "cityEN": "Bengal", "townID": "BGXX000000", "townName": "达卡", "townEN": "Dhaka"},
    "Burma": {"cityName": "缅甸", "cityEN": "Burma", "townID": "BMXX000000", "townName": "内比都", "townEN": "Naypyidaw"},
    "缅甸": {"cityName": "缅甸", "cityEN": "Burma", "townID": "BMXX000000", "townName": "内比都", "townEN": "Naypyidaw"},
    "Thailand": {"cityName": "泰国", "cityEN": "Thailand", "townID": "THXX000000", "townName": "曼谷", "townEN": "Bangkok"},
    "泰国": {"cityName": "泰国", "cityEN": "Thailand", "townID": "THXX000000", "townName": "曼谷", "townEN": "Bangkok"},
    "Kampuchea": {
        "cityName": "柬埔寨",
        "cityEN": "Kampuchea",
        "townID": "CBXX000000",
        "townName": "金边",
        "townEN": "Phnom Penh"
    },
    "柬埔寨": {"cityName": "柬埔寨", "cityEN": "Kampuchea", "townID": "CBXX000000", "townName": "金边", "townEN": "Phnom Penh"},
    "Vietnam": {"cityName": "越南", "cityEN": "Vietnam", "townID": "VMXX000000", "townName": "河内", "townEN": "Hanoi"},
    "越南": {"cityName": "越南", "cityEN": "Vietnam", "townID": "VMXX000000", "townName": "河内", "townEN": "Hanoi"},
    "Philippines": {
        "cityName": "菲律宾",
        "cityEN": "Philippines",
        "townID": "RPXX000000",
        "townName": "马尼拉",
        "townEN": "Manila"
    },
    "菲律宾": {"cityName": "菲律宾", "cityEN": "Philippines", "townID": "RPXX000000", "townName": "马尼拉", "townEN": "Manila"},
    "South Korea": {
        "cityName": "韩国",
        "cityEN": "South Korea",
        "townID": "KSXX000000",
        "townName": "首尔",
        "townEN": "Seoul"
    },
    "韩国": {"cityName": "韩国", "cityEN": "South Korea", "townID": "KSXX000000", "townName": "首尔", "townEN": "Seoul"},
    "North Korea": {
        "cityName": "朝鲜",
        "cityEN": "North Korea",
        "townID": "KNXX000000",
        "townName": "平壤",
        "townEN": "Pyongyang"
    },
    "朝鲜": {"cityName": "朝鲜", "cityEN": "North Korea", "townID": "KNXX000000", "townName": "平壤", "townEN": "Pyongyang"},
    "Mongolia": {
        "cityName": "蒙古",
        "cityEN": "Mongolia",
        "townID": "MGXX000000",
        "townName": "乌兰巴托",
        "townEN": "Ulan Bator"
    },
    "蒙古": {"cityName": "蒙古", "cityEN": "Mongolia", "townID": "MGXX000000", "townName": "乌兰巴托", "townEN": "Ulan Bator"},
    "United Arab Emirates": {
        "cityName": "阿联酋",
        "cityEN": "United Arab Emirates",
        "townID": "AEXX000000",
        "townName": "阿布扎比",
        "townEN": "Abu Dhabi"
    },
    "阿联酋": {
        "cityName": "阿联酋",
        "cityEN": "United Arab Emirates",
        "townID": "AEXX000000",
        "townName": "阿布扎比",
        "townEN": "Abu Dhabi"
    },
    "Singapore": {
        "cityName": "新加坡",
        "cityEN": "Singapore",
        "townID": "SNXX000000",
        "townName": "新加坡",
        "townEN": "Singapore"
    },
    "新加坡": {"cityName": "新加坡", "cityEN": "Singapore", "townID": "SNXX000000", "townName": "新加坡", "townEN": "Singapore"},
    "Maldives": {"cityName": "马尔代夫", "cityEN": "Maldives", "townID": "MVXX000000", "townName": "马累", "townEN": "Male"},
    "马尔代夫": {"cityName": "马尔代夫", "cityEN": "Maldives", "townID": "MVXX000000", "townName": "马累", "townEN": "Male"},
    "East Asia": {
        "cityName": "亚洲东部",
        "cityEN": "East Asia",
        "townID": "BXXX000000",
        "townName": "斯里巴加湾市 (文莱)",
        "townEN": "Bandar Seri Begawan (Brunei)"
    },
    "亚洲东部": {
        "cityName": "亚洲东部",
        "cityEN": "East Asia",
        "townID": "BXXX000000",
        "townName": "斯里巴加湾市 (文莱)",
        "townEN": "Bandar Seri Begawan (Brunei)"
    },
    "Central Asia": {
        "cityName": "亚洲中部",
        "cityEN": "Central Asia",
        "townID": "AFXX000000",
        "townName": "喀布尔 (阿富汗)",
        "townEN": "Kabul (Afghanistan)"
    },
    "亚洲中部": {
        "cityName": "亚洲中部",
        "cityEN": "Central Asia",
        "townID": "AFXX000000",
        "townName": "喀布尔 (阿富汗)",
        "townEN": "Kabul (Afghanistan)"
    },
    "West Asia": {
        "cityName": "亚洲西部",
        "cityEN": "West Asia",
        "townID": "AJXX000000",
        "townName": "巴库 (阿塞拜疆)",
        "townEN": "Baku (Azerbaijan)"
    },
    "亚洲西部": {
        "cityName": "亚洲西部",
        "cityEN": "West Asia",
        "townID": "AJXX000000",
        "townName": "巴库 (阿塞拜疆)",
        "townEN": "Baku (Azerbaijan)"
    },
    "Russia (Europe)": {
        "cityName": "俄罗斯 (欧洲部分)",
        "cityEN": "Russia (Europe)",
        "townID": "RSXX000000",
        "townName": "莫斯科",
        "townEN": "Moscow"
    },
    "俄罗斯 (欧洲部分)": {
        "cityName": "俄罗斯 (欧洲部分)",
        "cityEN": "Russia (Europe)",
        "townID": "RSXX000000",
        "townName": "莫斯科",
        "townEN": "Moscow"
    },
    "Russia (Asia)": {
        "cityName": "俄罗斯 (亚洲部分)",
        "cityEN": "Russia (Asia)",
        "townID": "RSXX250000",
        "townName": "叶卡捷琳堡",
        "townEN": "Yekaterinburg"
    },
    "俄罗斯 (亚洲部分)": {
        "cityName": "俄罗斯 (亚洲部分)",
        "cityEN": "Russia (Asia)",
        "townID": "RSXX250000",
        "townName": "叶卡捷琳堡",
        "townEN": "Yekaterinburg"
    },
    "Germany": {"cityName": "德国", "cityEN": "Germany", "townID": "GMXX000000", "townName": "柏林", "townEN": "Berlin"},
    "德国": {"cityName": "德国", "cityEN": "Germany", "townID": "GMXX000000", "townName": "柏林", "townEN": "Berlin"},
    "United Kingdom": {
        "cityName": "英国",
        "cityEN": "United Kingdom",
        "townID": "UKXX000000",
        "townName": "伦敦",
        "townEN": "London"
    },
    "英国": {"cityName": "英国", "cityEN": "United Kingdom", "townID": "UKXX000000", "townName": "伦敦", "townEN": "London"},
    "France": {"cityName": "法国", "cityEN": "France", "townID": "FRXX000000", "townName": "巴黎", "townEN": "Paris"},
    "法国": {"cityName": "法国", "cityEN": "France", "townID": "FRXX000000", "townName": "巴黎", "townEN": "Paris"},
    "Spain": {"cityName": "西班牙", "cityEN": "Spain", "townID": "SPXX000000", "townName": "马德里", "townEN": "Madrid"},
    "西班牙": {"cityName": "西班牙", "cityEN": "Spain", "townID": "SPXX000000", "townName": "马德里", "townEN": "Madrid"},
    "Italy": {"cityName": "意大利", "cityEN": "Italy", "townID": "ITXX000000", "townName": "罗马", "townEN": "Rome"},
    "意大利": {"cityName": "意大利", "cityEN": "Italy", "townID": "ITXX000000", "townName": "罗马", "townEN": "Rome"},
    "Greece": {"cityName": "希腊", "cityEN": "Greece", "townID": "GRXX000000", "townName": "雅典", "townEN": "Athens"},
    "希腊": {"cityName": "希腊", "cityEN": "Greece", "townID": "GRXX000000", "townName": "雅典", "townEN": "Athens"},
    "Romania": {
        "cityName": "罗马尼亚",
        "cityEN": "Romania",
        "townID": "ROXX000000",
        "townName": "布加勒斯特",
        "townEN": "Bucharest"
    },
    "罗马尼亚": {
        "cityName": "罗马尼亚",
        "cityEN": "Romania",
        "townID": "ROXX000000",
        "townName": "布加勒斯特",
        "townEN": "Bucharest"
    },
    "Ukraine": {"cityName": "乌克兰", "cityEN": "Ukraine", "townID": "UPXX000000", "townName": "基辅", "townEN": "Kiev"},
    "乌克兰": {"cityName": "乌克兰", "cityEN": "Ukraine", "townID": "UPXX000000", "townName": "基辅", "townEN": "Kiev"},
    "Belorussia": {
        "cityName": "白俄罗斯",
        "cityEN": "Belorussia",
        "townID": "BOXX000000",
        "townName": "明斯克",
        "townEN": "Minsk"
    },
    "白俄罗斯": {"cityName": "白俄罗斯", "cityEN": "Belorussia", "townID": "BOXX000000", "townName": "明斯克", "townEN": "Minsk"},
    "Poland": {"cityName": "波兰", "cityEN": "Poland", "townID": "PLXX000000", "townName": "华沙", "townEN": "Warsaw"},
    "波兰": {"cityName": "波兰", "cityEN": "Poland", "townID": "PLXX000000", "townName": "华沙", "townEN": "Warsaw"},
    "Finland": {
        "cityName": "芬兰",
        "cityEN": "Finland",
        "townID": "FIXX000000",
        "townName": "赫尔辛基",
        "townEN": "Helsinki"
    },
    "芬兰": {"cityName": "芬兰", "cityEN": "Finland", "townID": "FIXX000000", "townName": "赫尔辛基", "townEN": "Helsinki"},
    "Sweden": {
        "cityName": "瑞典",
        "cityEN": "Sweden",
        "townID": "SWXX000000",
        "townName": "斯德哥尔摩",
        "townEN": "Stockholm"
    },
    "瑞典": {"cityName": "瑞典", "cityEN": "Sweden", "townID": "SWXX000000", "townName": "斯德哥尔摩", "townEN": "Stockholm"},
    "Norway": {"cityName": "挪威", "cityEN": "Norway", "townID": "NOXX000000", "townName": "奥斯陆", "townEN": "Oslo"},
    "挪威": {"cityName": "挪威", "cityEN": "Norway", "townID": "NOXX000000", "townName": "奥斯陆", "townEN": "Oslo"},
    "Holland": {
        "cityName": "荷兰",
        "cityEN": "Holland",
        "townID": "NLXX000000",
        "townName": "阿姆斯特丹",
        "townEN": "Amsterdam"
    },
    "荷兰": {"cityName": "荷兰", "cityEN": "Holland", "townID": "NLXX000000", "townName": "阿姆斯特丹", "townEN": "Amsterdam"},
    "Belgium": {
        "cityName": "比利时",
        "cityEN": "Belgium",
        "townID": "BEXX000000",
        "townName": "布鲁塞尔",
        "townEN": "Brussels"
    },
    "比利时": {"cityName": "比利时", "cityEN": "Belgium", "townID": "BEXX000000", "townName": "布鲁塞尔", "townEN": "Brussels"},
    "Switzerland": {
        "cityName": "瑞士",
        "cityEN": "Switzerland",
        "townID": "SZXX000000",
        "townName": "伯尔尼",
        "townEN": "Berne"
    },
    "瑞士": {"cityName": "瑞士", "cityEN": "Switzerland", "townID": "SZXX000000", "townName": "伯尔尼", "townEN": "Berne"},
    "Austria": {"cityName": "奥地利", "cityEN": "Austria", "townID": "AUXX000000", "townName": "维也纳", "townEN": "Vienna"},
    "奥地利": {"cityName": "奥地利", "cityEN": "Austria", "townID": "AUXX000000", "townName": "维也纳", "townEN": "Vienna"},
    "East Europe": {
        "cityName": "欧洲东部",
        "cityEN": "East Europe",
        "townID": "ENXX000000",
        "townName": "塔林 (爱沙尼亚)",
        "townEN": "Tallinn (Estonia)"
    },
    "欧洲东部": {
        "cityName": "欧洲东部",
        "cityEN": "East Europe",
        "townID": "ENXX000000",
        "townName": "塔林 (爱沙尼亚)",
        "townEN": "Tallinn (Estonia)"
    },
    "West Europe": {
        "cityName": "欧洲西部",
        "cityEN": "West Europe",
        "townID": "MTXX000000",
        "townName": "瓦莱塔 (马耳他)",
        "townEN": "Valletta (Malta)"
    },
    "欧洲西部": {
        "cityName": "欧洲西部",
        "cityEN": "West Europe",
        "townID": "MTXX000000",
        "townName": "瓦莱塔 (马耳他)",
        "townEN": "Valletta (Malta)"
    },
    "East United States": {
        "cityName": "美国 (东部)",
        "cityEN": "East United States",
        "townID": "USDC000000",
        "townName": "华盛顿",
        "townEN": "Washington"
    },
    "美国 (东部)": {
        "cityName": "美国 (东部)",
        "cityEN": "East United States",
        "townID": "USDC000000",
        "townName": "华盛顿",
        "townEN": "Washington"
    },
    "South United States": {
        "cityName": "美国 (南部)",
        "cityEN": "South United States",
        "townID": "USGA000000",
        "townName": "亚特兰大",
        "townEN": "Atlanta"
    },
    "美国 (南部)": {
        "cityName": "美国 (南部)",
        "cityEN": "South United States",
        "townID": "USGA000000",
        "townName": "亚特兰大",
        "townEN": "Atlanta"
    },
    "West United States": {
        "cityName": "美国 (西部)",
        "cityEN": "West United States",
        "townID": "USCA000000",
        "townName": "旧金山",
        "townEN": "San Francisco"
    },
    "美国 (西部)": {
        "cityName": "美国 (西部)",
        "cityEN": "West United States",
        "townID": "USCA000000",
        "townName": "旧金山",
        "townEN": "San Francisco"
    },
    "Canada": {"cityName": "加拿大", "cityEN": "Canada", "townID": "CAXX000000", "townName": "渥太华", "townEN": "Ottawa"},
    "加拿大": {"cityName": "加拿大", "cityEN": "Canada", "townID": "CAXX000000", "townName": "渥太华", "townEN": "Ottawa"},
    "Mexico": {
        "cityName": "墨西哥",
        "cityEN": "Mexico",
        "townID": "MXDF000000",
        "townName": "墨西哥城",
        "townEN": "Mexico City"
    },
    "墨西哥": {"cityName": "墨西哥", "cityEN": "Mexico", "townID": "MXDF000000", "townName": "墨西哥城", "townEN": "Mexico City"},
    "North America Others": {
        "cityName": "北美洲其他",
        "cityEN": "North America Others",
        "townID": "GTXX000000",
        "townName": "危地马拉市 (危地马拉)",
        "townEN": "Guatemala City (Guatemala)"
    },
    "北美洲其他": {
        "cityName": "北美洲其他",
        "cityEN": "North America Others",
        "townID": "GTXX000000",
        "townName": "危地马拉市 (危地马拉)",
        "townEN": "Guatemala City (Guatemala)"
    },
    "Greenland": {
        "cityName": "格陵兰岛 (丹)",
        "cityEN": "Greenland",
        "townID": "GLXX000000",
        "townName": "戈特霍市 (努克)",
        "townEN": "Gadthab (Nuuk)"
    },
    "格陵兰岛 (丹)": {
        "cityName": "格陵兰岛 (丹)",
        "cityEN": "Greenland",
        "townID": "GLXX000000",
        "townName": "戈特霍市 (努克)",
        "townEN": "Gadthab (Nuuk)"
    },
    "North Caribbean Sea": {
        "cityName": "加勒比海北部",
        "cityEN": "North Caribbean Sea",
        "townID": "CUXX000000",
        "townName": "哈瓦那 (古巴)",
        "townEN": "Havana (Cuba)"
    },
    "加勒比海北部": {
        "cityName": "加勒比海北部",
        "cityEN": "North Caribbean Sea",
        "townID": "CUXX000000",
        "townName": "哈瓦那 (古巴)",
        "townEN": "Havana (Cuba)"
    },
    "Southeast Caribbean Sea": {
        "cityName": "加勒比海东南部",
        "cityEN": "Southeast Caribbean Sea",
        "townID": "USPR000000",
        "townName": "圣胡安 (波多黎各)",
        "townEN": "San Juan (Puerto Rico)"
    },
    "加勒比海东南部": {
        "cityName": "加勒比海东南部",
        "cityEN": "Southeast Caribbean Sea",
        "townID": "USPR000000",
        "townName": "圣胡安 (波多黎各)",
        "townEN": "San Juan (Puerto Rico)"
    },
    "Brazil": {"cityName": "巴西", "cityEN": "Brazil", "townID": "BRXX000000", "townName": "巴西利亚", "townEN": "Brasilia"},
    "巴西": {"cityName": "巴西", "cityEN": "Brazil", "townID": "BRXX000000", "townName": "巴西利亚", "townEN": "Brasilia"},
    "Argentina": {
        "cityName": "阿根廷",
        "cityEN": "Argentina",
        "townID": "ARBA000000",
        "townName": "布宜诺斯艾利斯",
        "townEN": "Buenos Aires"
    },
    "阿根廷": {
        "cityName": "阿根廷",
        "cityEN": "Argentina",
        "townID": "ARBA000000",
        "townName": "布宜诺斯艾利斯",
        "townEN": "Buenos Aires"
    },
    "Venezuela": {
        "cityName": "委内瑞拉",
        "cityEN": "Venezuela",
        "townID": "VEXX000000",
        "townName": "加拉加斯",
        "townEN": "Caracas"
    },
    "委内瑞拉": {
        "cityName": "委内瑞拉",
        "cityEN": "Venezuela",
        "townID": "VEXX000000",
        "townName": "加拉加斯",
        "townEN": "Caracas"
    },
    "Columbia": {
        "cityName": "哥伦比亚",
        "cityEN": "Columbia",
        "townID": "COXX000000",
        "townName": "圣菲波哥大",
        "townEN": "Santa Fe de Bogota"
    },
    "哥伦比亚": {
        "cityName": "哥伦比亚",
        "cityEN": "Columbia",
        "townID": "COXX000000",
        "townName": "圣菲波哥大",
        "townEN": "Santa Fe de Bogota"
    },
    "Peru": {"cityName": "秘鲁", "cityEN": "Peru", "townID": "PEXX000000", "townName": "利马", "townEN": "Lima"},
    "秘鲁": {"cityName": "秘鲁", "cityEN": "Peru", "townID": "PEXX000000", "townName": "利马", "townEN": "Lima"},
    "Bolivia": {"cityName": "玻利维亚", "cityEN": "Bolivia", "townID": "BLXX000000", "townName": "苏克雷", "townEN": "Sucre"},
    "玻利维亚": {"cityName": "玻利维亚", "cityEN": "Bolivia", "townID": "BLXX000000", "townName": "苏克雷", "townEN": "Sucre"},
    "Chile": {"cityName": "智利", "cityEN": "Chile", "townID": "CIXX000000", "townName": "圣地亚哥", "townEN": "Santiago"},
    "智利": {"cityName": "智利", "cityEN": "Chile", "townID": "CIXX000000", "townName": "圣地亚哥", "townEN": "Santiago"},
    "South America Others": {
        "cityName": "南美洲其他",
        "cityEN": "South America Others",
        "townID": "ECXX000000",
        "townName": "基多 (厄瓜多尔)",
        "townEN": "Quito (Ecuador)"
    },
    "南美洲其他": {
        "cityName": "南美洲其他",
        "cityEN": "South America Others",
        "townID": "ECXX000000",
        "townName": "基多 (厄瓜多尔)",
        "townEN": "Quito (Ecuador)"
    },
    "South Africa": {
        "cityName": "南非",
        "cityEN": "South Africa",
        "townID": "SFXX000000",
        "townName": "比勒陀利亚",
        "townEN": "Pretoria"
    },
    "南非": {
        "cityName": "南非",
        "cityEN": "South Africa",
        "townID": "SFXX000000",
        "townName": "比勒陀利亚",
        "townEN": "Pretoria"
    },
    "Egypt": {"cityName": "埃及", "cityEN": "Egypt", "townID": "EGXX000000", "townName": "开罗", "townEN": "Cairo"},
    "埃及": {"cityName": "埃及", "cityEN": "Egypt", "townID": "EGXX000000", "townName": "开罗", "townEN": "Cairo"},
    "Libya": {"cityName": "利比亚", "cityEN": "Libya", "townID": "LYXX000000", "townName": "的黎波里", "townEN": "Tripoli"},
    "利比亚": {"cityName": "利比亚", "cityEN": "Libya", "townID": "LYXX000000", "townName": "的黎波里", "townEN": "Tripoli"},
    "Tunisia": {"cityName": "突尼斯", "cityEN": "Tunisia", "townID": "TSXX000000", "townName": "突尼斯", "townEN": "Tunis"},
    "突尼斯": {"cityName": "突尼斯", "cityEN": "Tunisia", "townID": "TSXX000000", "townName": "突尼斯", "townEN": "Tunis"},
    "Algeria": {
        "cityName": "阿尔及利亚",
        "cityEN": "Algeria",
        "townID": "AGXX000000",
        "townName": "阿尔及尔",
        "townEN": "Algiers"
    },
    "阿尔及利亚": {
        "cityName": "阿尔及利亚",
        "cityEN": "Algeria",
        "townID": "AGXX000000",
        "townName": "阿尔及尔",
        "townEN": "Algiers"
    },
    "Morocco": {"cityName": "摩洛哥", "cityEN": "Morocco", "townID": "MOXX000000", "townName": "拉巴特", "townEN": "Rabat"},
    "摩洛哥": {"cityName": "摩洛哥", "cityEN": "Morocco", "townID": "MOXX000000", "townName": "拉巴特", "townEN": "Rabat"},
    "Mauritania": {
        "cityName": "毛里塔尼亚",
        "cityEN": "Mauritania",
        "townID": "MRXX000000",
        "townName": "努瓦克肖特",
        "townEN": "Nouakchott"
    },
    "毛里塔尼亚": {
        "cityName": "毛里塔尼亚",
        "cityEN": "Mauritania",
        "townID": "MRXX000000",
        "townName": "努瓦克肖特",
        "townEN": "Nouakchott"
    },
    "Mali": {"cityName": "马里", "cityEN": "Mali", "townID": "MLXX000000", "townName": "巴马科", "townEN": "Bamako"},
    "马里": {"cityName": "马里", "cityEN": "Mali", "townID": "MLXX000000", "townName": "巴马科", "townEN": "Bamako"},
    "Niger": {"cityName": "尼日尔", "cityEN": "Niger", "townID": "NGXX000000", "townName": "尼亚美", "townEN": "Niamey"},
    "尼日尔": {"cityName": "尼日尔", "cityEN": "Niger", "townID": "NGXX000000", "townName": "尼亚美", "townEN": "Niamey"},
    "Nigeria": {"cityName": "尼日利亚", "cityEN": "Nigeria", "townID": "NIXX000000", "townName": "阿布贾", "townEN": "Abuja"},
    "尼日利亚": {"cityName": "尼日利亚", "cityEN": "Nigeria", "townID": "NIXX000000", "townName": "阿布贾", "townEN": "Abuja"},
    "Sultan": {"cityName": "苏丹", "cityEN": "Sultan", "townID": "SUXX000000", "townName": "喀土穆", "townEN": "Khartoum"},
    "苏丹": {"cityName": "苏丹", "cityEN": "Sultan", "townID": "SUXX000000", "townName": "喀土穆", "townEN": "Khartoum"},
    "Ethiopia": {
        "cityName": "埃塞俄比亚",
        "cityEN": "Ethiopia",
        "townID": "ETXX000000",
        "townName": "亚的斯亚贝巴",
        "townEN": "Addis Abeba"
    },
    "埃塞俄比亚": {
        "cityName": "埃塞俄比亚",
        "cityEN": "Ethiopia",
        "townID": "ETXX000000",
        "townName": "亚的斯亚贝巴",
        "townEN": "Addis Abeba"
    },
    "Democratic Republic of Congo": {
        "cityName": "刚果民主共和国",
        "cityEN": "Democratic Republic of Congo",
        "townID": "CGXX000000",
        "townName": "金沙萨",
        "townEN": "Kinshasa"
    },
    "刚果民主共和国": {
        "cityName": "刚果民主共和国",
        "cityEN": "Democratic Republic of Congo",
        "townID": "CGXX000000",
        "townName": "金沙萨",
        "townEN": "Kinshasa"
    },
    "Angola": {"cityName": "安哥拉", "cityEN": "Angola", "townID": "AOXX000000", "townName": "罗安达", "townEN": "Luanda"},
    "安哥拉": {"cityName": "安哥拉", "cityEN": "Angola", "townID": "AOXX000000", "townName": "罗安达", "townEN": "Luanda"},
    "Zambia": {"cityName": "赞比亚", "cityEN": "Zambia", "townID": "ZAXX000000", "townName": "卢萨卡", "townEN": "Lusaka"},
    "赞比亚": {"cityName": "赞比亚", "cityEN": "Zambia", "townID": "ZAXX000000", "townName": "卢萨卡", "townEN": "Lusaka"},
    "Tanzania": {
        "cityName": "坦桑尼亚",
        "cityEN": "Tanzania",
        "townID": "TZXX000000",
        "townName": "达累斯萨拉姆",
        "townEN": "Dar es Salaam"
    },
    "坦桑尼亚": {
        "cityName": "坦桑尼亚",
        "cityEN": "Tanzania",
        "townID": "TZXX000000",
        "townName": "达累斯萨拉姆",
        "townEN": "Dar es Salaam"
    },
    "Mozambique": {
        "cityName": "莫桑比克",
        "cityEN": "Mozambique",
        "townID": "MZXX000000",
        "townName": "马普托",
        "townEN": "Maputo"
    },
    "莫桑比克": {"cityName": "莫桑比克", "cityEN": "Mozambique", "townID": "MZXX000000", "townName": "马普托", "townEN": "Maputo"},
    "Madagascar": {
        "cityName": "马达加斯加",
        "cityEN": "Madagascar",
        "townID": "MAXX000000",
        "townName": "塔那那利佛",
        "townEN": "Antananarivo"
    },
    "马达加斯加": {
        "cityName": "马达加斯加",
        "cityEN": "Madagascar",
        "townID": "MAXX000000",
        "townName": "塔那那利佛",
        "townEN": "Antananarivo"
    },
    "Mauritius": {
        "cityName": "毛里求斯",
        "cityEN": "Mauritius",
        "townID": "MPXX000000",
        "townName": "路易港",
        "townEN": "Port Louis"
    },
    "毛里求斯": {
        "cityName": "毛里求斯",
        "cityEN": "Mauritius",
        "townID": "MPXX000000",
        "townName": "路易港",
        "townEN": "Port Louis"
    },
    "Seychelles": {
        "cityName": "塞舌尔",
        "cityEN": "Seychelles",
        "townID": "SEXX000000",
        "townName": "维多利亚 (塞舌尔)",
        "townEN": "Victoria (Seychelles)"
    },
    "塞舌尔": {
        "cityName": "塞舌尔",
        "cityEN": "Seychelles",
        "townID": "SEXX000000",
        "townName": "维多利亚 (塞舌尔)",
        "townEN": "Victoria (Seychelles)"
    },
    "East Africa": {
        "cityName": "非洲东部",
        "cityEN": "East Africa",
        "townID": "ERXX000000",
        "townName": "阿斯马拉 (厄立特里亚)",
        "townEN": "Asmara (Eritrea)"
    },
    "非洲东部": {
        "cityName": "非洲东部",
        "cityEN": "East Africa",
        "townID": "ERXX000000",
        "townName": "阿斯马拉 (厄立特里亚)",
        "townEN": "Asmara (Eritrea)"
    },
    "Central Africa": {
        "cityName": "非洲中部",
        "cityEN": "Central Africa",
        "townID": "CTXX000000",
        "townName": "班基 (中非)",
        "townEN": "Bangui (Central Africa)"
    },
    "非洲中部": {
        "cityName": "非洲中部",
        "cityEN": "Central Africa",
        "townID": "CTXX000000",
        "townName": "班基 (中非)",
        "townEN": "Bangui (Central Africa)"
    },
    "West Africa": {
        "cityName": "非洲西部",
        "cityEN": "West Africa",
        "townID": "BNXX000000",
        "townName": "波多诺伏 (贝宁)",
        "townEN": "Porto-Novo (Benin)"
    },
    "非洲西部": {
        "cityName": "非洲西部",
        "cityEN": "West Africa",
        "townID": "BNXX000000",
        "townName": "波多诺伏 (贝宁)",
        "townEN": "Porto-Novo (Benin)"
    },
    "Australia": {
        "cityName": "澳大利亚",
        "cityEN": "Australia",
        "townID": "ASXX000000",
        "townName": "堪培拉",
        "townEN": "Canberra"
    },
    "澳大利亚": {
        "cityName": "澳大利亚",
        "cityEN": "Australia",
        "townID": "ASXX000000",
        "townName": "堪培拉",
        "townEN": "Canberra"
    },
    "undefined": {"cityName": "新西兰", "townID": "NZXX000000", "townName": "惠灵顿", "townEN": "Wellington"},
    "新西兰": {"cityName": "新西兰", "townID": "NZXX000000", "townName": "惠灵顿", "townEN": "Wellington"},
    "Papua New Guinea": {
        "cityName": "巴布亚新几内亚",
        "cityEN": "Papua New Guinea",
        "townID": "PPXX000000",
        "townName": "莫尔兹比港",
        "townEN": "Port Moresby"
    },
    "巴布亚新几内亚": {
        "cityName": "巴布亚新几内亚",
        "cityEN": "Papua New Guinea",
        "townID": "PPXX000000",
        "townName": "莫尔兹比港",
        "townEN": "Port Moresby"
    },
    "Saipan": {"cityName": "塞班岛", "cityEN": "Saipan", "townID": "USMP000000", "townName": "塞班", "townEN": "Saipan"},
    "塞班岛": {"cityName": "塞班岛", "cityEN": "Saipan", "townID": "USMP000000", "townName": "塞班", "townEN": "Saipan"},
    "Oceania Others": {
        "cityName": "大洋洲其他",
        "cityEN": "Oceania Others",
        "townID": "USGU000000",
        "townName": "阿加尼亚 (关岛)",
        "townEN": "Agana (Guam)"
    },
    "大洋洲其他": {
        "cityName": "大洋洲其他",
        "cityEN": "Oceania Others",
        "townID": "USGU000000",
        "townName": "阿加尼亚 (关岛)",
        "townEN": "Agana (Guam)"
    }
}
const request = require('request');

const en = /^[a-z]+$/
function getCityCode(city) {
    if (en.test(city)) {
        //传入的是英文
        city = city.charAt(0).toUpperCase() + city.substr(1);
        let code = weatherCode.hasOwnProperty(city) ? weatherCode[city].townID : 'CHSH000000';
        return code;
    }
    else {
        //认为传入的是中文
        //去掉名称中的‘市’(目前国内城市名都认为不带‘市’,国外暂只支持到国/洲级别)
        city = city.replace('市', '');
        let code = weatherCode.hasOwnProperty(city) ? weatherCode[city].townID : 'CHSH000000';
        return code;
    }
}

async function reqWeather(city,that) {
    return new Promise((resolve,reject) => {
        let key = that.config.weatherkey;
        let username = that.config.weatherusername;
        console.log(key,username);
        let t = Date.parse( new Date())/1000;
        let lang = 'zh';
        let returnParam =
            {
                lang: lang,
                location: city,
                t: t,
                username: username,

            };
        let field = utils.ToMap(returnParam);
        let argus = [];
        field.forEach((v, k) => {
            argus.push(k + "=" + v);
        });
        let plain = argus.join("&") + key;
        let sign = utils.MD5(plain);
        let turl = "https://free-api.heweather.com/s6/weather/now?parameters&location=" + encodeURIComponent(city) + "&username=" + username + "&t=" + t + "&lang=" + lang + "&sign=" + encodeURIComponent(sign);
        that.logger.info(city);
        that.logger.info(turl);
        request(turl, (err, res, body) => {
            if(err) {
                reject(err);
                return;
            }
        //    that.logger.info(body);
          try{
              let getWeather = JSON.parse(body);
              let heWeather6 = getWeather.HeWeather6[0];
              if (heWeather6.status != 'ok') {
                  reject(body);
                  return;
              }
              resolve(heWeather6);
          }catch(err) {
              reject(err)
          }

        })
    })
}

module.exports = reqWeather;