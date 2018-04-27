const config = require('./config')
const fs = require('fs')
const path = require('path');
const sheets = require('../../../sheets/travel')

//-----list files
let files = {};
let result = {};
let rootDir = path.join(config.picBaseDir, config.picDirName);
// recFile(rootDir);
// compare();

lownamePic(rootDir)

function recFile(f) {
    let st = fs.statSync(f);
    if (st.isFile()) {
        let key = path.join(config.picDirName, f.split(config.picDirName)[1]).replace(/\\+/g, '/')
        files[key] = 1;
    } else {
        //directory
        fs.readdirSync(f).every(ff => {
            let subFl = path.join(f, ff);
            recFile(subFl);
            return true;
        })
    }
}

function compare() {
    let scenics = sheets.scenicspots;
    scenics.forEach(s => {
        let pic = s.picture;
        if (files[pic]) {
            files[pic]++;
        } else {
            //rec lack of picture
            result[pic] = true;
        }
    })

    let lacks = Object.keys(result);
    let lackLen = lacks.length;

    let exts = [];
    let exLen = 0;
    for (let k in files) {
        if (files[k] == 1) {
            exLen++;
            exts.push(k);
        }
    }

    let str = `总览：缺少资源数->${lackLen}; 没用上的资源数->${exLen};\n缺少资源:\n`;
    str += lacks.join('\n');
    str += '\n\n\n没用上的资源:\n'
    str += exts.join('\n');

    fs.appendFileSync(config.outFile, str, { flag: 'w' })

    console.log(`统计结果已经导出到${config.outFile}`)
}

//将资源里jingdian下的图片后缀名都改为小写
function lownamePic(f) {
    let st = fs.statSync(f);
    if (st.isFile()) {
        let dirNm = path.dirname(f);
        let exNm = path.extname(f).toLowerCase();

        let flNm = path.basename(f).split('.')[0];

        let newfl = path.join(dirNm, `${flNm}${exNm}`);

        if (f != newfl) {
            console.log('rename fl>>', f);
            fs.renameSync(f, newfl);

        }
    } else {
        //directory
        fs.readdirSync(f).every(ff => {
            let subFl = path.join(f, ff);
            lownamePic(subFl);
            return true;
        })
    }
}