//格子分配
const ROW = 8;
const COL = 6;
//视图尺寸
const WD = 750;
const HT = 1000;
//格子尺寸
const GW = WD / COL;
const GH = HT / ROW;
//第一次分格，格子尺寸小一写，以解决坐标聚集问题
const GWT = GW / 10;
const GHT = GH / 10;

function toXY(points) {
    //find bounds value
    const tempV = -1000;
    let prev = {minJ: -tempV, minW: -tempV, maxJ: tempV, maxW: tempV};
    let arr = points.concat();
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
    let rateX = WD / dmx;
    let rateY = HT / dmy;
    
    //scale
    let cgx = 0;
    let cgy = 0;

    let lgx = 0;
    let rgx = 0;
    let lgy = 0;
    let rgy = 0;

    let topleft = {gx: 0, gy: 0};
    let topRight = {gx: Math.floor(WD / GWT), gy: 0};
    let bottomLeft = {gx: 0, gy: Math.floor(HT / GHT)};
    let bottomRight = {gx: topRight.gx, gy: bottomLeft.gy};

    arr = arr.map(d => {
        let o = {name: d.name};
        o.x = (d.j - prev.minJ) * rateX;
        o.y = (prev.maxW - d.w) * rateY; //纬度跟直角坐标的y是反的

        //计算格子坐标
        o.gx = Math.floor(o.x / GWT);
        o.gy = Math.floor(o.y / GHT);

        if (o.gx < lgx) {
            lgx = o.gx;
        }
        if (o.gx > rgx) {
            rgx = o.gx;
        }
        if (o.gy < lgy) {
            lgy = o.gy;
        }
        if (o.gy > rgy) {
            rgy = o.gy;
        }
        return o;
    });

    //集聚中心
    cgx = lgx + (rgx - lgx) / 2;
    cgy = lgy + (rgy - lgy) / 2;
    //四个象限的缩放比率
    let distTL = Math.sqrt((cgx - topleft.gx) ** 2 + (cgy - topleft.gy) ** 2);
    let distTR = Math.sqrt((cgx - topRight.gx) ** 2 + (cgy - topRight.gy) ** 2);
    let distBL = Math.sqrt((cgx - bottomLeft.gx) ** 2 + (cgy - topleft.gy) ** 2);
    let distBR = Math.sqrt((cgx - bottomRight.gx) ** 2 + (cgy - bottomRight.gy) ** 2);
    let distAll = distTL + distTR + distBL + distBR;
    let rate = 10;//放大率
    //格子坐标放大
    let scaleTL = distTL / distAll * rate;
    let scaleTR = distTR / distAll * rate;
    let scaleBL = distBL / distAll * rate;
    let scaleBR = distBR / distAll * rate;
    arr.every(a => {
        //判断此点相对于集聚中心的象限
        let dx = a.gx - cgx;
        let dy = a.gy - cgy;
        let rotation = Math.atan2(dy, dx) * 180 / Math.PI + 360;
        rotation %= 360;

        if (0 < rotation && rotation <= 90) {
            a.gx *= scaleBR;
            a.gy *= scaleBR;
        }
        else if (90 < rotation && rotation <= 180) {
            a.gx *= scaleBL;
            a.gy *= scaleBL;
        }
        else if (180 < rotation && rotation <= 270) {
            a.gx *= scaleTL;
            a.gy *= scaleTL;
        }
        else {
            a.gx *= scaleTR;
            a.gy *= scaleTR;
        }
        return true;
    })

    return arr;
}

//test
let points = [{
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

let xys = toXY(points);

console.log(xys);