const path = require("path");
const fs = require("fs");
const xlsx = require("node-xlsx");
const dust = require("../dust");

//-----------data vars------------
const SHEET_HEADS = 3; //表头所占据的行数

//支持的字段类型
const TYPE_TAG  = {
    STR: "Str",
    INT: "Int",
    INTS: "Ints",
    ITEM: "Item",
    ITEMS: "Items"
}
const OUT_TAG = {
    CLIENT: ".C",
    SERVER: ".S",
}

class Field {
    constructor(name, cmts) {
        this.name = name;
        this.comments = cmts;
    }
}
class Sheet {
    constructor(shtName) {
        this.fileds = [];
        this.sheetname = shtName;
        this.classname = shtName.substr(0, 1).toUpperCase() + shtName.substr(1);
    }
}
class Data {
    constructor(){
        this.jsondata = {};
        this.sheets = [];
    }
    get json() {
        return JSON.stringify(this.jsondata);
    }
}

//-------------enter---------------------------------
//读取配置
const cfg = require('./config');
const parsedData = {
    client: new Data(),
    server: new Data()
}

//开始处理
Promise.all(Object.keys(cfg).map( key => {
    gen(key, cfg[key]);
})).then(()=> {
    console.log('处理完成！')
})
//--------------end----------------------------------

//-------------functions------------------
async function gen(cfgKey, cfgNode) {
    if (!cfgNode.enable) {
        return;
    }

    let inDir = cfgNode.inDir;
    let outFileC = cfgNode.outFileC;
    let outFileS = cfgNode.outFileS;

    //判断inDir是文件夹，还是文件
    let st = fs.statSync(inDir);
    if (st.isFile()) {
        parseFile(inDir);
    }
    else {
        let files;
        try {
            files = fs.readdirSync(inDir).map(f => {
                return path.resolve(inDir, f);
            })
        }catch (e) {
            console.error(e)
            console.warn(`未找到${cfgKey}的inputDir配置的目标路径：${inDir} 请检查后重试！！！`);
            return;
        }

        //开始读表转换
        files.every(f => {
            parseFile(f);
        })
    }

    //写入output文件
    await dust.gen('sheet',
        {data: parsedData.client, outfile: outFileC},
        {data: parsedData.server, outfile: outFileS});
}


function parseFile(flPath) {
    let fl = path.basename(flPath);
    var extName = path.extname(fl);
    if (/^[a-zA-Z]+/.test(fl) == false) {
        //文件名不能为全中文命名
        return;
    }
    if (extName == ".xlsx") {
        var sheets = xlsx.parse(flPath);
        //先筛选出有效的工作表
        var validSheets = {};
        for (var i = 0; i < sheets.length; i++) {
            var sht = sheets[i];
            if (/Sheet[0-9]+/.test(sht.name)) {
                //excel 的默认表名不处理
                continue;
            }
            if (sht.data.length < SHEET_HEADS) {
                continue;
            }
            if (validSheets[sht.name]) {
                console.error(fl + "中出现了已存在过的导出表名>>" + sht.name);
            } else {
                validSheets[sht.name] = sht.data;
                mergeToJson(sht.data, sht.name, flPath);
            }
        }
    }
}

function mergeToJson(sht, sheetName, fl) {
    //sht==其中一个工作表的内容
    parsedData.client.jsondata[sheetName] = {};
    parsedData.server.jsondata[sheetName] = {};

    //先读掉前几行配置、类型、注释等
    var shtHeads = sht.slice(0, SHEET_HEADS); //表头
    let data = sht.slice(SHEET_HEADS); //数据
    var colComments = shtHeads[0]; //中文字段名
    var colNames = shtHeads[1]; //字段名
    var colFlags = shtHeads[2]; //字段导出标识

    //生成数据类声明
    let sheetClzC = new Sheet(sheetName);
    let sheetClzS = new Sheet(sheetName);

    //有效数据的起始列索引
    var colStart = 0;

    //每行数据生成一个包装单元
    for (var i in data) {
        var cellC = {};
        var cellS = {};
        var line = data[i];

        for (var k = colStart; k < colNames.length; k++) {
            var clName = colNames[k];
            var clFlag = colFlags[k];
            var clCmts = colComments[k];


            //字段过滤
            if (clName ) {
                //转换数据
                clFlag = clFlag || TYPE_TAG.STR;//空值，按Str处理

                let clData = parseType(clFlag.split('.')[0], line[k]);

                //记录数据
                if (clFlag.indexOf(OUT_TAG.CLIENT) != -1) {
                    //此字段仅客户端使用
                    i == 0 && sheetClzC.fileds.push(new Field(clName, clCmts));
                    cellC[clName] = clData;
                }
                else if (clFlag.indexOf(OUT_TAG.SERVER) != -1) {
                    //此字段仅服务器使用
                    i == 0 && sheetClzS.fileds.push(new Field(clName, clCmts));
                    cellS[clName] = clData;
                }
                else {
                    //此字段前后端都用
                    i == 0 && sheetClzC.fileds.push(new Field(clName, clCmts));
                    i == 0 && sheetClzS.fileds.push(new Field(clName, clCmts));
                    cellC[clName] = clData;
                    cellS[clName] = clData;
                }
            }

        }

        let idName = line[colStart]
        if (idName) {
            parsedData.client.jsondata[sheetName][idName] = cellC;
            parsedData.server.jsondata[sheetName][idName] = cellS;
        }
    }

    //记录类声明
    sheetClzC.fileds.length && parsedData.client.sheets.push(sheetClzC);
    sheetClzS.fileds.length && parsedData.server.sheets.push(sheetClzS);
}


function parseType(type, data) {
    switch (type) {
        case TYPE_TAG.INT:
            return parseInt(data);
        case TYPE_TAG.INTS:
            return data.split(',').map(d => parseInt(d));
        case TYPE_TAG.ITEM:
            let kv = {};
            let arr = data.split(':');
            kv.k = arr[0];
            kv.v = arr[1];
            return kv;
        case TYPE_TAG.ITEMS:
            return data.split(',').map(it => {
                return parseType(TYPE_TAG.ITEM, it);
            });
        default:// string
            return data ? (data + "").replace(/\n/g, "\\n") : "";
    }

}
