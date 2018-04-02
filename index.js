// npm run dev DO NOT read this file
var os = require('os');

require('egg').startCluster({
    baseDir: __dirname,
    https: {
        key: __dirname + "/config/server.key",
        cert: __dirname + "/config/server.pem"
    },
    port: 443,
    sticky: true,
    workers:1
});

//不知道为啥mac下chrome要占用443端口 换端口了在mac下