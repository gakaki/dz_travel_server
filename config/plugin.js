// had enabled by egg
// exports.static = true;

exports.mongoose = {
    enable: true,
    package: 'egg-mongoose',
};

exports.redis = {
    enable: true,
    package: 'egg-redis',
};
// exports.io = {
//     enable: true,
//     package: 'egg-socket.io',
// };
exports.kue = {
    enable: true,
    package: 'dz-kue',
};

exports.assets = {
    enable: true,
    package: 'egg-view-assets',
};

exports.nunjucks = {
    enable: true,
    package: 'egg-view-nunjucks',
};