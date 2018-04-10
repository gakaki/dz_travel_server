const travelConfig = require("../../../sheets/travel");
const ScenicPos = require("../../../sheets/scenicpos");
const moment = require("moment");
const holidayCn = require('holiday.cn').default;


let city = travelConfig.City.Get(1);
city.scenicspot.map((s, idx) => {
    let o = {};
    let cfg = travelConfig.Scenicspot.Get(s);
    let xy = ScenicPos.Get(s);
    o.id = s;
    o.cid = cid;
    o.name = cfg.scenicspot;
    o.building = cfg.building;
    o.x = xy.x;
    o.y = xy.y;
    o.index = idx;// 真实情况，应该读库
}),