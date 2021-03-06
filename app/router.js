/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    const {router, controller, io} = app;
    router.get('/user/login', controller.publicController.userController.login);
    router.get('/user/changeitem', controller.publicController.userController.changeitem);
    router.get('/user/getiteminfo', controller.publicController.userController.getiteminfo);

    router.get('/weChat/auth', controller.weChatController.weChatController.auth);
    router.get('/weChat/minapppay', controller.weChatController.weChatController.minapppay);
    router.get('/weChat/minappwithdraw', controller.weChatController.weChatController.minappwithdraw);
    router.get('/weChat/shopdone/:appName', controller.weChatController.weChatController.shopdone);
    router.post('/weChat/shopdone/:appName', controller.weChatController.weChatController.shopdone);

    router.get('/guessnum/sendpack', controller.guessnumController.guessnumController.sendpack);
    router.get('/guessnum/guesspack', controller.guessnumController.guessnumController.guesspack);
    router.get('/guessnum/clearcd', controller.guessnumController.guessnumController.clearcd);
    router.get('/guessnum/getpackrecords', controller.guessnumController.guessnumController.getpackrecords);
    router.get('/guessnum/getpackrankinglist', controller.guessnumController.guessnumController.getpackrankinglist);
    router.get('/guessnum/getuserpackrecords', controller.guessnumController.guessnumController.getuserpackrecords);
    router.get('/guessnum/getacceleration', controller.guessnumController.guessnumController.getacceleration);

    /*    io.of('/english').route('join', io.controller.englishIOController.english.joinRoom);
        io.of('/english').route('leave', io.controller.englishIOController.english.leaveRoom);*/
    io.of('/english').route('ranking', io.controller.englishIOController.englishIOController.ranking);

};
