'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

  router.get('/', controller.home.index);
  router.get('/user/login', controller.user.login);
  router.get('/user/auth', controller.user.auth);
  router.get('/user/minapppay', controller.user.minapppay);
  router.get('/user/minappwithdraw', controller.user.minappwithdraw);
  router.get('/user/shopdone', controller.user.shopdone);
  router.get('/guessnum/sendpack', controller.guessnum.sendpack);
  router.get('/guessnum/guesspack', controller.guessnum.guesspack);
  router.get('/guessnum/clearcd', controller.guessnum.clearcd);
  router.get('/guessnum/getpackrecords', controller.guessnum.getpackrecords);
  router.get('/guessnum/getpackrankinglist', controller.guessnum.getpackrankinglist);
  router.get('/guessnum/getuserpackrecords', controller.guessnum.getuserpackrecords);
  router.get('/guessnum/getacceleration', controller.guessnum.getacceleration);
};
