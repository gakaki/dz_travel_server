module.exports = {
    //注：配的相对路径，是相对于本项目根路径，即‘./’表示package.json所在的目录
    travel: {
        enable: true,
        inDir: './app/tools/genApi/apis/travel',//可以是目录，也可以是具体到某个文件,文件
        outFileC: '../travel/api.js',
        outFileS: './apis/travel.js'
    },

}