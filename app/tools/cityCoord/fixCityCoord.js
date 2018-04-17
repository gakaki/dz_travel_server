const sheets = require('../../../sheets/travel')
const xlsx = require('node-xlsx')
const mapv = require('mapv')
const fs = require('fs')

sheets.citys.every(c => {
    let name = c.city;
    if (name) {
        let coords = mapv.utilCityCenter.getCenterByCityName(name);
        if (coords) {
            //经测，大兴安岭 查不到经纬度
            c.coordinate = [coords.lng, coords.lat];
        }
    }

    return true;
})

let data = sheets.citys.map(c => {
    let cc = [c.id, c.coordinate ? c.coordinate.join(',') : '']
    return cc;
})


let buffer = xlsx.build([{ name: 'city', data: data }]);

fs.appendFileSync('./city.xlsx', buffer, {flag:'w'});

console.log('已经生成百度地图的城市经纬度表')
