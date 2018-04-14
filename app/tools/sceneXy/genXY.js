const sheets = require('../../../sheets/travel');
const toXY = require('./toXY');
const dust = require('../dust');
const config = require('./config');

//declare
class ScenicXy {
    constructor() {
        this.id = 0;
        this.x = 0;
        this.y = 0;
    }
}

//读取city表，对每个city的景点，计算其在页面展示时的格子坐标、格子尺寸
let json = {};
// sheets.citys = sheets.citys.slice(0,1)
sheets.citys.forEach(c => {
    let spots = [];
    c.scenicspot.every(s => {
        let sp = sheets.Scenicspot.Get(s);
        if (sp) {
            let jw = sp.coordinate;
            //只取id和经纬度
            if (jw[0] && jw[1]) //表里配的有空的，得过滤下
                spots.push({id: s, j: jw[0], w: jw[1], cityId: c.id})
        }
        else {
            console.log(`city表id为${c.id}的行scenicspot中未找到id为${s}的景点,跳过。。。`)
        }

        return true;
    });

    //将城市坐标放入其中，作为游玩景点的起点
    c.coordinate && c.coordinate.length && spots.push({id: c.id, j: c.coordinate[0], w: c.coordinate[1], cityId: c.id});
    let xys = toXY(spots);

    xys.forEach(xy => {
        json[xy.id] = xy;
    })
});

//output to file
dust.gen('scenicpos', {data: {json: JSON.stringify(json)}, outfile: config.outFile})