'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

  router.get('/', controller.home.index);
  router.get('/user', controller.user.login);
  router.get('/user/auth', controller.user.auth);
};
