function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function flatten(arr) {
  return arr.reduce(function (prev, item) {
    return prev.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
}

const getDistace = (a, b) => Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)

let points = [{
    name: 'A',
    id: 1,
    x: 116.403414,
    y: 39.924091
  },
  {
    name: 'b',
    id: 2,
    x: 116.274853,
    y: 39.998547
  },
  {
    name: 'c',
    id: 3,
    x: 116.404081,
    y: 39.910098
  },
  {
    name: 'd',
    id: 4,
    x: 116.417115,
    y: 39.886376
  },
  {
    name: 'e',
    id: 5,
    x: 116.314154,
    y: 40.01651
  },
  {
    name: 'easd',
    id: 6,
    x: 116.395486,
    y: 39.932913
  },

  {
    name: 'f',
    id: 7,
    x: 116.016033,
    y: 40.364233
  },
  {
    name: 'g',
    id: 8,
    x: 116.409512,
    y: 39.93986
  },
  {
    name: 'h',
    id: 9,
    x: 116.391656,
    y: 39.948203
  },
  {
    name: 'i',
    id: 10,
    x: 116.402359,
    y: 39.999763
  }
]

let arrx = [1, 3, 5, 7, 9]
let arry = [1, 3, 5, 7, 9, 11, 13]

let res = []
for (let i = 0; i < arrx.length; i++) {
  res[i] = []
  for (let j = 0; j < arry.length; j++) {
    res[i][j] = {}
    res[i][j]['x'] = arrx[i]
    res[i][j]['y'] = arry[j]
  }
}
res = flatten(res)
let finalRes = []
for (let i = 0; i < 10; i++) {
  let len = res.length
  finalRes.push(res.splice(parseInt(getRandomArbitrary(0, len)), 1)[0])
  len--
}

let pointsDistance = points.map(item => {
  return Object.assign({}, item, {
    distance: getDistace({
      x: 0,
      y: 0
    }, item)
  })
})
let finalResDistance = finalRes.map((item, i) => {
  return Object.assign({}, item, {
    id: i + 1,
    distance: getDistace({
      x: 0,
      y: 0
    }, item)
  })
})

finalResDistance.sort((a, b) => b.distance - a.distance)
pointsDistance.sort((a, b) => b.distance - a.distance)

let finalratio = finalResDistance.map((item, i) => {
  return Object.assign({}, {
    x: item.x * 20,
    y: item.y * 35,
    name: pointsDistance[i].name
  })
})

console.log(finalratio);
