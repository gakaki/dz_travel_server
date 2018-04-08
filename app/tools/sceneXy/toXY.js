//格子分配
const ROW = 8;
const COL = 6;
//视图尺寸
const WD = 750;
const HT = 1000;
//格子尺寸
const GW = WD / COL;
const GH = HT / ROW;

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
    let rateX = WD / (prev.maxJ - prev.minJ);
    let rateY = HT / (prev.maxW - prev.minW);
    
    //scale
    arr = arr.map(d => {
        let o = {name: d.name};
        o.x = (d.j - prev.minJ) * rateX;
        o.y = (prev.maxW - d.w) * rateY; //纬度跟直角坐标的y是反的

        //计算格子坐标
        o.gx = Math.floor(o.x / GW);
        o.gy = Math.floor(o.y / GH);
        return o;
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