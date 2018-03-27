/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    const {router, controller, io,ws} = app;
    router.get('/user/login', controller.publicController.userController.login);
    router.get('/user/changeitem', controller.publicController.userController.changeitem);
    router.get('/user/getiteminfo', controller.publicController.userController.getiteminfo);

    router.get('/weChat/auth', controller.weChatController.weChatController.auth);
    router.get('/weChat/minapppay', controller.weChatController.weChatController.minapppay);
    router.get('/weChat/minappwithdraw', controller.weChatController.weChatController.minappwithdraw);
    router.get('/weChat/minappreferrer', controller.weChatController.weChatController.minappreferrer);
    router.get('/weChat/shopdone/:appName', controller.weChatController.weChatController.shopdone);
    router.post('/weChat/shopdone/:appName', controller.weChatController.weChatController.shopdone);

    router.get('/travel/index', controller.travelController.travelController.index);


};
