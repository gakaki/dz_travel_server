'use strict';

// npm run dev DO NOT read this file

require('egg').startCluster({
    baseDir: __dirname,
    https:{
        key: __dirname+"/config/server.key",
        cert: __dirname+"/config/server.pem"
    },
    port: 443

});