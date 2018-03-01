const fs = require('fs');
const path = require('path');
const dust = require("../dust");

//--------------declares----------------------
const API_FILE_EXT = '.api';
class Prop {
    constructor(name, type, writeonly) {
        this.name = name;
        this.type = type;
        this.writeonly = writeonly;//server 端时，对output字段设置writeonly；client端时，对input字段设置writeonly
    }
}
class Clazz {
    constructor() {
        this.props = [];
        this.funcs = [];
    }
}
class Enumm {
    constructor(name) {
        this.name = name;
        thia.consts = [];
    }
}
class Data {
    constructor(){
        this.classes = [];
    }
}

const SYNTAX = {
    CLASS: 'class',
    ENUM: 'enum',
    API: 'api',
    PROP: 'prop',
    FUNC: 'func',
    REQUIRED: 'required',
    OPTIONAL: 'optional',
    INPUT: 'input',
    OUTPUT: 'output',
    EXTENDS: 'extends'
};

const Type = {
    STR: 'string',
    NUM: 'number'
};

class Processor {
    process(data) {

    }
}

class Syntax {
    constructor() {
        this.map = new Map();
        this.tempData = {};
    }
    reg(tag, processor) {
        this.map.set(tag, processor);
    }

    process(tag, data) {
        if (this.map.has(tag)) {
            this.map.get(tag).process(data);
        }
    }
}

class ClzProcessor extends Processor{
    process(data) {

    }
}
class EnumProcessor extends Processor{
    process(data) {

    }
}
class ExtendsProcessor extends Processor{
    process(data) {

    }
}
class PropProcessor extends Processor{
    process(data) {

    }
}
class FuncProcessor extends Processor{
    process(data) {

    }
}




const parsedData = {
    client: new Data(),
    server: new Data()
}
//--------------------------------------------


//读取配置
const cfg = require('./config');
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
    await dust.gen('api',
        {data: parsedData.client, outfile: outFileC},
        {data: parsedData.server, outfile: outFileS});
}

function parseFile(flPath) {
    let fl = path.basename(flPath);
    let extName = path.extname(fl);
    let pathname = path.dirname(flPath);
    if (extName != API_FILE_EXT) {
        //文件后缀名不对的，不处理
        return;
    }

    //开始读文件
    let lines = fs.readFileSync(flPath, 'utf8').split(/[\r]\n/g);
    lines.every( (ln, idx) => {
        if (ln) {
            let tags = ln.split(/\s/g);
            console.log(tags)

            for (let i = 0; i < tags.length; i++) {
                let tag = tags[i].trim();
                if (!tag)
                    continue;

                if (tag in SYNTAX) {
                    syntax.process(tag, ln)
                }
            }
        }
        return true;
    })
}

