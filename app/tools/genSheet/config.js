module.exports = {
    //注：配的相对路径，是相对于本项目根路径，即‘./’表示package.json所在的目录
    guessnum: {
        enable: false,
        inDir:'../h5group/design/小程序/配置表',//可以配置到文件夹，会处理该文件夹下的所有xlsx文件
        outFileC:'../guessnum/sheets.js',
        outFileS:'./sheets/guessnum.js',
    },
    english: {
        enable: false,
        inDir:'../h5group/design/小程序/配置表/guessenglish.xlsx',//也可以配置到具体文件，只处理这一个文件
        outFileC:'../english/sheets.js',
        outFileS:'./sheets/english.js',
    },
    travel: {
        enable: true,
        // inDir:'../../../svn/design/小程序/配置表/tour.xlsx',//也可以配置到具体文件，只处理这一个文件
        inDir:'../H5/design/小程序/配置表/tour.xlsx',//也可以配置到具体文件，只处理这一个文件
        outFileC:'../travel/sheets.js',
        outFileS:'./sheets/travel.js',
        chunkC: 500 * 1024, //是否对客户端表拆分（小程序客户端对文件超过500k的js文件跳过es5转译，所以如果客户端表太大，需要拆分）
    },
}