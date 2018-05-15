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

exports.Sha1 = function(str) {
    return crypto.createHash('sha1').update(str).digest('hex');
}

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

Date.prototype.format = function(fmt) {
    let o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(let k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}

exports.getMonday = function() {
    let day = new Date().getDay() ? new Date().getDay() : 7;
    return new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - day + 1)
}