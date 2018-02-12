const utils=require('./utils');

let ALPHAS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

let DIGITALS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

let ALDIGS = ALPHAS.concat(DIGITALS);

function Random(arr) {
    if (!arr || arr.length == 0){
        return null;
    }
    let index=utils.Rangei(0,arr.length);
    return arr[index];
}

function Nonce(arr, len) {
    let r = "";
    while (len--)
        r += Random(arr);
    return r;
}

exports.NonceAlDig=function(len) {
    return Nonce(ALDIGS, len);
};
