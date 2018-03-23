const fs = require('fs');
const path = require('path');
const dust = require("../dust");
dust.trimWrap = true;

//--------------declares----------------------
const API_FILE_EXT = '.api';

class KV {
    constructor(k, v) {
        this.k = k;
        this.v = v;
        this.isClient = false;
        this.isServer = false;
    }
}

class Func {
    constructor() {
        this.contents = [];
        this.contentStr = '';
        this.isClient = false;
        this.isServer = false;
    }

    genContentStr() {
        this.contentStr = this.contents.join('\n').replace(/\s[{}]\s?/g, str => {
            if (str.indexOf('{') > -1)
                return '{'
            return '}'
        });
    }
}

class Structor {
    constructor(name) {
        this.mustcacheOpening = 0;
        this.mustcacheClosed = false;
        this.name = name; //数据结构名（class or enum's define name)
    }
}

class Clazz extends Structor {
    constructor(name) {
        super(name);
        this.isApi = false;
        this.action = '';//isApi为true时有值
        this.parent = '';//父类名称,读取extends，当类型为api时，无extends则默认父类为Base
        this.propsC = [];//仅客户端使用的属性
        this.propsS = [];//仅服务器使用的属性
        this.requires = [];//api需要的输入字段
        this.optionals = [];//api可选的输入字段
        this.outputs = [];//api输入字段
        this.reqFields = [];
        this.resFields = [];
        this.reqFieldStr = '';
        this.resFieldStr = '';
        this.funcs = [];//类的固有函数
    }

    genFieldStr() {
        this.reqFields = mergeParentArr(this, 'reqFields');
        this.resFields = mergeParentArr(this, 'resFields');
        this.reqFieldStr = JSON.stringify(this.reqFields);
        this.resFieldStr = JSON.stringify(this.resFields);
        let flname = path.basename(curFl, '.api');
        this.action = `${flname}.${parsing.name.toLowerCase()}`;
    }

}

function mergeParentArr(from, field) {
    let arr = from.hasOwnProperty(field)? from[field] : [];
    if (from.parent) {
        let parent = parsedData.classDic[from.parent];
        if (parent) {
            arr = arr.concat(mergeParentArr(parent, field))
        }
    }
    else {
        if (from.hasOwnProperty(field)) {
            let vs = from[field]
            return vs || [];
        }
    }
    return Array.from(new Set(arr));
}

class Enumm extends Structor {
    constructor(name) {
        super(name);
        this.consts = [];
    }
}

class Data {
    constructor() {
        this.classDic = {};
        this.classes = [];
        this.enums = [];
    }
}

const SYNTAX = {
    IMPORT: 'import',
    CLASS: 'class',
    ENUM: 'enum',
    API: 'api',
    PROP: 'prop',
    CONST: 'const',
    FUNC: 'func',
    REQUIRED: 'required',
    OPTIONAL: 'optional',
    OUTPUT: 'output',
    EXTENDS: 'extends',
    MS_LEFT: '{',
    MS_RIGHT: '}',
    FUNC_OUT_CLIENT: 'client',
    FUNC_OUT_SERVER: 'server'
};


class Processor {
    //处理一个语法，如果遇到新的语法，就调用新语法对应的处理器处理
    parse(tags) {
        process.nextTick(() => {
            syntax.readTag(tags);
        })
    }

}


class Syntax {
    constructor() {
        this.map = new Map();
        this.blankP = new BlankProcessor();
        this.curLine = '';
        this._funcParsing = null;//函数的解析特殊处理
    }

    reg(tag, processor) {
        this.map.set(tag, processor);
    }

    async start() {
        let that = this;
        return new Promise(resolve => {
            that.resolve = resolve;
            this.readLine();
        })
    }

    readLine() {
        if (!lines.length) {
            this.resolve();
            return;
        }
        let ln = lines.pop();
        //兼容字符与大括号有/无空格
        ln = ln.replace(new RegExp(SYNTAX.MS_LEFT, 'g'), ' ' + SYNTAX.MS_LEFT + ' ');
        ln = ln.replace(new RegExp(SYNTAX.MS_RIGHT, 'g'), ' ' + SYNTAX.MS_RIGHT + ' ');

        //兼容:/=前后空格
        ln = ln.replace(/\s+=\s+/g, "=");
        ln = ln.replace(/\s+:\s+/g, ":");


        this.curLine = ln;
        this.recordFunLine();
        let tags = this.curLine.split(/\s\t?/g).reverse();

        this.readTag(tags);
    }

    readTag(tags) {
        //如果一行完了，就下一行
        if (!tags.length) {
            this.readLine();
        }
        else {
            let tag = tags.pop();
            let synt = tag.trim();
            if (synt) {
                this.process(synt, tags);
            }
            else {
                this.readTag(tags);
            }
        }

    }

    process(synt, tags) {
        if (this._funcParsing) {

            if (synt == SYNTAX.MS_LEFT || synt == SYNTAX.MS_RIGHT) {
                this.map.get(synt).parse(tags);
            }
            else {
                this.readTag(tags);
            }

        }
        else if (this.map.has(synt)) {
            this.map.get(synt).parse(tags);
        }
        else {
            this.blankP.parse(tags);
        }
    }

    set funcParsing(val) {
        if (val) {
            this._funcParsing = val;
            this.recordFunLine();
        }
        else {
            //clear
            this._funcParsing.genContentStr();
            parsing.funcs.push(this._funcParsing);
            this._funcParsing = null;

        }
    }

    recordFunLine() {
        if (this._funcParsing) {
            this.curLine = this.curLine.replace(/\s?(func|client|server)\s+/g, str => {
                str = str.trim();
                if (str == SYNTAX.FUNC_OUT_CLIENT)
                    this._funcParsing.isClient = true;
                else if (str == SYNTAX.FUNC_OUT_SERVER)
                    this._funcParsing.isServer = true;
                return ''
            })

            //函数内，=号与{号前后强制留空格，以防止=号与其他语法字符粘连
            this.curLine = this.curLine.replace('={', ' = {');

            this._funcParsing.contents.push(this.curLine);
        }
    }
}

class BlankProcessor extends Processor {
    parse(tags) {
        tags.pop();//对不需要处理的，直接跳掉这个tag
        super.parse(tags);
    }
}

class ClzProcessor extends Processor {
    parse(tags) {
        super.parse(tags);

        parsing = new Clazz(tags.pop());
    }
}

class ApiProcessor extends ClzProcessor {
    parse(tags) {
        super.parse(tags);
        parsing.isApi = true;
        parsing.parent = 'Base';
    }
}

class EnumProcessor extends Processor {
    parse(tags) {
        super.parse(tags);
        parsing = new Enumm(tags.pop());
    }
}

class ExtendsProcessor extends Processor {
    parse(tags) {
        super.parse(tags);
        parsing.parent = tags.pop();
    }
}

class PropProcessor extends Processor {
    parse(tags) {
        //PropProcessor只处理Class内的字段声明
        if (parsing instanceof Clazz) {
            let typeTag = tags.pop();
            let types;
            if (typeTag == SYNTAX.FUNC_OUT_CLIENT) {
                types = tags.pop().split(':');
                parsing.propsC.push(new KV(types[0], types[1]));
            }
            else if (typeTag == SYNTAX.FUNC_OUT_SERVER) {
                types = tags.pop().split(':');
                parsing.propsS.push(new KV(types[0], types[1]));
            }
            else {
                types = typeTag.split(':');
                let kv = new KV(types[0], types[1])
                parsing.propsC.push(kv);
                parsing.propsS.push(kv);
            }
        }
        else {
            console.error('非class/api声明内，不可出现 prop 语法！！！', `请检查${curFl}文件及其通过import语法引用的文件`)
            process.exit(1);
        }
        super.parse(tags);
    }
}

class ConstProcessor extends Processor {
    parse(tags) {
        //constProcessor只处理 Enum内的声明
        if (parsing instanceof Enumm) {
            let types = tags.pop().split('=');
            parsing.consts.push(new KV(types[0], types[1]));
        }
        else {
            console.error('非enum声明内，不可出现 const 语法！！！', `请检查${curFl}文件及其通过import语法引用的文件`)
            process.exit(1);
        }
        super.parse(tags);
    }
}

class RequireProcessor extends Processor {
    parse(tags) {
        //RequireProcessor只处理api的字段，表示该字段是客户端必需传入的
        if (parsing.isApi) {
            let types = tags.pop().split(':');
            parsing.requires.push(new KV(types[0], types[1]));
            parsing.reqFields.push(types[0])
        }
        else {
            console.error('非api声明内，不可出现 require 语法！！！', `请检查${curFl}文件及其通过import语法引用的文件`)
            process.exit(1);
        }

        super.parse(tags);
    }
}

class OptionalProcessor extends Processor {
    parse(tags) {
        //RequireProcessor只处理api的字段，表示该字段是客户端可选传入的
        if (parsing.isApi) {
            let types = tags.pop().split(':');
            parsing.optionals.push(new KV(types[0], types[1]));
            parsing.reqFields.push(types[0])
        }
        else {
            console.error('非api声明内，不可出现 optional 语法！！！', `请检查${curFl}文件及其通过import语法引用的文件`)
            process.exit(1);
        }

        super.parse(tags);
    }
}

class OutputProcessor extends Processor {
    parse(tags) {
        //OutputProcessor只处理api的字段，表示该字段是服务器返回的数据
        if (parsing.isApi) {
            let types = tags.pop().split(':');
            parsing.outputs.push(new KV(types[0], types[1]));
            parsing.resFields.push(types[0])
        }
        else {
            console.error('非api声明内，不可出现 output 语法！！！', `请检查${curFl}文件及其通过import语法引用的文件中的${parsing.name}声明中的行${syntax.curLine}`)
            process.exit(1);
        }

        super.parse(tags);
    }
}

class MustacheLProcessor extends Processor {
    parse(tags) {
        parsing.mustcacheOpening++
        tags.pop();
        super.parse(tags);
    }
}

class MustacheRProcessor extends Processor {
    parse(tags) {
        parsing.mustcacheOpening--;
        if (parsing.mustcacheOpening == 1) {
            //类的函数已闭合
            syntax.funcParsing = null;
        }
        if (parsing.mustcacheOpening == 0) {
            //一个类或enum已闭合
            parsing.mustcacheClosed = true;
            if (parsing instanceof Enumm) {
                parsedData.enums.push(parsing);
            }
            else {
                if (parsing instanceof Clazz) {
                    parsing.genFieldStr();
                }
                if (!parsedData.classDic[parsing.name]) {
                    parsedData.classDic[parsing.name] = parsing;
                    parsedData.classes.push(parsing);
                }
            }
        }

        tags.pop();
        super.parse(tags);
    }
}

class FuncProcessor extends Processor {
    parse(tags) {
        tags.pop();//drop 'func'
        syntax.funcParsing = new Func();

        super.parse(tags);
    }
}

class ImpProcessor extends Processor {
    parse(tags) {
        let pathname = path.dirname(curFl);
        let impFl = tags.pop();
        let impFlPath = path.dirname(impFl);

        if (impFlPath == pathname) {
            console.log(`同级目录内的文件，不需要import来引用，会自动将同级目录内所有文件读取并输出到配置的导出js文件中！`)
            super.parse(tags);
            return;
        }

        //读取非同级目录下的import文件
        let flName = path.basename(impFl);
        if (imports.hasOwnProperty(flName)) {
            super.parse(tags);
            return; //已经引入过
        }

        let realImpFl = path.resolve(pathname, impFl);
        console.log(`读取导入的文件${realImpFl}`)
        //将引入的文件放到lines中
        lines = fs.readFileSync(realImpFl, 'utf8').split(/[\r\n]+/g).reverse().concat(lines);
        super.parse(tags);
    }
}


const parsedData = new Data();

let curFl;//当前处理中的文件
let imports = {};//外部文件导入记录
let lines;//全部文本行
let parsing;//class or enum;以大括号配对成class/api/enum为组，一组解析完成后再解析下一组，所以不支持类的嵌套
//--------------------------------------------

const syntax = new Syntax();
syntax.reg(SYNTAX.IMPORT, new ImpProcessor());
syntax.reg(SYNTAX.CLASS, new ClzProcessor());
syntax.reg(SYNTAX.API, new ApiProcessor());
syntax.reg(SYNTAX.ENUM, new EnumProcessor());
syntax.reg(SYNTAX.PROP, new PropProcessor());
syntax.reg(SYNTAX.CONST, new ConstProcessor());
syntax.reg(SYNTAX.REQUIRED, new RequireProcessor());
syntax.reg(SYNTAX.OPTIONAL, new OptionalProcessor());
syntax.reg(SYNTAX.OUTPUT, new OutputProcessor());
syntax.reg(SYNTAX.FUNC, new FuncProcessor());
syntax.reg(SYNTAX.EXTENDS, new ExtendsProcessor());
syntax.reg(SYNTAX.MS_LEFT, new MustacheLProcessor());
syntax.reg(SYNTAX.MS_RIGHT, new MustacheRProcessor());


//读取配置
const cfg = require('./config');
let files;//要处理的文件列表，根据cfg读取
let parsedFiles = {};//已处理的文件列表
//开始处理
Promise.all(Object.keys(cfg).map(key => {
    gen(key, cfg[key]);
})).then(() => {
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
    parsedData.appName = cfgKey;

    //判断inDir是文件夹，还是文件
    let st = fs.statSync(inDir);
    if (st.isFile()) {
        files = [inDir];
    }
    else {
        try {
            files = fs.readdirSync(inDir).map(f => {
                return path.resolve(inDir, f);
            })
        } catch (e) {
            console.error(e)
            console.warn(`未找到${cfgKey}的inputDir配置的目标路径：${inDir} 请检查后重试！！！`);
            return;
        }
    }

    await parseFile();

    //对类按依赖关系排序
    listClass();

    //写入output文件
    await dust.gen('api',
        {data: parsedData, outfile: outFileC},
        {data: Object.assign({server: true,}, parsedData), outfile: outFileS});
}


async function parseFile() {
    if (files.length) {
        curFl = files.pop();
        if (parsedFiles.hasOwnProperty(curFl)) {
            await parseFile();
        }
        parsedFiles[curFl] = true;
        let fl = path.basename(curFl);
        let extName = path.extname(fl);
        if (extName != API_FILE_EXT) {
            //文件后缀名不对的，不处理
            await parseFile();
        }

        //开始读文件

        lines = fs.readFileSync(curFl, 'utf8').split(/[\r\n]+/g).reverse();
        await syntax.start();

        //loop
        await parseFile();
    }
    else {
        return;
    }

}

function listClass() {
    parsedData.classes.sort((a, b) => {
        return getExtendsDepth(a) - getExtendsDepth(b);
    })
}

function getExtendsDepth(clz) {
    let depth = 0;
    while (clz.parent) {
        depth++;
        clz = parsedData.classDic[clz.parent];
    }
    return depth;
}
