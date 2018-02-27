'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller,io } = app;
  router.get('/user/login', controller.publicController.user.login);
  router.get('/user/changeitem', controller.publicController.user.changeitem);
  router.get('/user/getiteminfo', controller.publicController.user.getiteminfo);

  router.get('/weChat/auth', controller.weChatController.weChat.auth);
  router.get('/weChat/minapppay', controller.weChatController.weChat.minapppay);
  router.get('/weChat/minappwithdraw', controller.weChatController.weChat.minappwithdraw);
  router.get('/weChat/shopdone/:appName', controller.weChatController.weChat.shopdone);
  router.post('/weChat/shopdone/:appName', controller.weChatController.weChat.shopdone);

  router.get('/guessnum/sendpack', controller.weSrvController.weSrv.sendpack);
  router.get('/guessnum/guesspack', controller.weSrvController.weSrv.guesspack);
  router.get('/guessnum/clearcd', controller.weSrvController.weSrv.clearcd);
  router.get('/guessnum/getpackrecords', controller.weSrvController.weSrv.getpackrecords);
  router.get('/guessnum/getpackrankinglist', controller.weSrvController.weSrv.getpackrankinglist);
  router.get('/guessnum/getuserpackrecords', controller.weSrvController.weSrv.getuserpackrecords);
  router.get('/guessnum/getacceleration', controller.weSrvController.weSrv.getacceleration);

/*    io.of('/english').route('join', io.controller.englishIOController.english.joinRoom);
    io.of('/english').route('leave', io.controller.englishIOController.english.leaveRoom);*/
    io.of('/english').route('ranking', io.controller.englishIOController.english.ranking);

};
