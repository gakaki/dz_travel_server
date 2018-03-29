const crypto = require("crypto");
const constant = require('./constant');

exports.Rangef = function (from, to) {
    return Math.random() * (to - from) + from;
};

exports.Rangei = function (from, to, close = false) {
    if (close) {
        return Math.round(this.Rangef(from, to));
    } else {
        return Math.floor(this.Rangef(from, to));
    }
};

exports.ToMap = function (obj, sort = true) {
    let r = new Map();
    let keys = Object.keys(obj);
    if (sort)
        keys.sort();
    keys.forEach(e => {
        r.set(e, obj[e]);
    });
    return r;
};

exports.MD5 = function (str, fmt = constant.Format.BASE64) {
    let hdl = crypto.createHash('md5').update(str);
    return fmt == constant.Format.BASE64 ? hdl.digest().toString("base64") : hdl.digest("hex");
};

//对象排序
exports.multisort = function (array, ...compairers) {
    return array.sort((a, b) => {
        for (const c of compairers) {
            const r = c(a, b);
            if (r !== 0) {
                return r;
            }
        }
    })
};

//数组随机
exports.shuffle = function(arr) {
    let  newArr = [];
    while (arr.length > 0) {
        let index = parseInt(Math.random() * (arr.length - 1));
        newArr.push(arr[index]);
        arr.splice(index, 1);
    }
    return newArr;
}

