const config = require('./config')
//视图尺寸
const WD = config.viewWidth;
const HT = config.viewHeight;

const PD_TOP = config.paddingTop;
const PD_BTM = config.paddingBottom;
const PD_LFT = config.paddingLeft;
const PD_RT = config.paddingRight;

const VW = WD - PD_LFT - PD_RT;
const VH = HT - PD_TOP - PD_BTM;
let minx = 0;
let miny = 0;
let maxx = 0;
let maxy = 0;

let points;

function gen(sourcePoints) {

    const tempV = -1000;
    let prev = {minJ: -tempV, minW: -tempV, maxJ: tempV, maxW: tempV};
    let arr = sourcePoints.concat();
    arr.forEach(cur => {
        if (prev.minJ > cur.j) {
            prev.minJ = cur.j;
        }
        if (prev.minW > cur.w) {
            prev.minW = cur.w;
        }
        if (prev.maxJ < cur.j) {
            prev.maxJ = cur.j;
        }
        if (prev.maxW < cur.w) {
            prev.maxW = cur.w;
        }
    });

    //scale arr's value to fix WD & HT
    let dmx = prev.maxJ - prev.minJ;
    let dmy = prev.maxW - prev.minW;
    let rateX = VW / dmx;
    let rateY = VH / dmy;

    points = arr.map(d => {
        let o = {};
        o.x = (d.j - prev.minJ) * rateX >> 0;
        o.y = (prev.maxW - d.w) * rateY >> 0; //纬度跟直角坐标的y是反的
        o.cityId = d.cityId;
        o.id = d.id;
        return o;
    });


    //进行N次布朗运行
    for (let i = 0; i < 5; i++) {
        brang()
    }

    //to int
    let scalex = (maxx - minx) / VW;
    let scaley = (maxy - miny) / VH;
    points.every(p => {

        p.x *= scalex;
        p.y *= scaley;
        p.x += PD_LFT;
        p.y += PD_TOP;
        p.x = p.x >> 0;
        p.y = p.y >> 0;
        delete p.cityId; // cityId只在执行时以备检测错误，不导出
        return true;
    });

    return points;

}

function brang() {

    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            if (j >= points.length) {
                break;
            }
            //假设a在左上，b右下
            let a = points[i];
            let b = points[j];
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            let angle = Math.atan2(dy, dx);

            let val = VW - dist;

            let mv = val * 0.03;

            console.log(dist,mv)
            //相对移动
            let sx = Math.cos(angle) * mv;
            let sy = Math.sin(angle) * mv;

            a.x -= sx;
            a.y -= sy;

            b.x += sx;
            b.y += sy;

            recxy(a, b);
        }
    }
}

function recxy(...nodes) {
    nodes.forEach(n => {
        if (minx > n.x) {
            minx = n.x;
        }
        if (miny > n.y) {
            miny = n.y;
        }
        if (maxx < n.x) {
            maxx = n.x;
        }
        if (maxy < n.y) {
            maxy = n.y;
        }

    })

}

//test
let testPoints = [{
    name: 'A',
    id: 1,
    j: 116.403414,
    w: 39.924091
},
    {
        name: 'b',
        id: 2,
        j: 116.274853,
        w: 39.998547
    },
    {
        name: 'c',
        id: 3,
        j: 116.404081,
        w: 39.910098
    },
    {
        name: 'd',
        id: 4,
        j: 116.417115,
        w: 39.886376
    },
    {
        name: 'e',
        id: 5,
        j: 116.314154,
        w: 40.01651
    },
    {
        name: 'easd',
        id: 6,
        j: 116.395486,
        w: 39.932913
    },

    {
        name: 'f',
        id: 7,
        j: 116.016033,
        w: 40.364233
    },
    {
        name: 'g',
        id: 8,
        j: 116.409512,
        w: 39.93986
    },
    {
        name: 'h',
        id: 9,
        j: 116.391656,
        w: 39.948203
    },
    {
        name: 'i',
        id: 10,
        j: 116.402359,
        w: 39.999763
    }
]


module.exports = gen;