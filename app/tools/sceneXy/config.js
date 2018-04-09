module.exports = {
    viewWidth: 750, //用于展示游玩景点的视图宽
    viewHeight: 1000, //用于展示游玩景点的视图高
    paddingTop: 50, //内边距-上
    paddingBottom: 100, //内边距-下
    paddingLeft: 0, //内边距-左
    paddingRight: 0, //内边距-右
    initRow: 8, //初始的行数,此值会在迭代中根据景点密度递增修正
    initCol: 6, //初始的列数,此值会在迭代中根据景点密度递增修正
    outFile: './sheets/scenicpos.js', //输出文件
}