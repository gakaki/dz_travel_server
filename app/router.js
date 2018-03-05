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
    router.get('/weChat/shopdone/:appName', controller.weChatController.weChatController.shopdone);
    router.post('/weChat/shopdone/:appName', controller.weChatController.weChatController.shopdone);

    router.get('/guessnum/sendpack', controller.guessnumController.guessnumController.sendpack);
    router.get('/guessnum/guesspack', controller.guessnumController.guessnumController.guesspack);
    router.get('/guessnum/clearcd', controller.guessnumController.guessnumController.clearcd);
    router.get('/guessnum/getpackrecords', controller.guessnumController.guessnumController.getpackrecords);
    router.get('/guessnum/getpackrankinglist', controller.guessnumController.guessnumController.getpackrankinglist);
    router.get('/guessnum/getuserpackrecords', controller.guessnumController.guessnumController.getuserpackrecords);
    router.get('/guessnum/getacceleration', controller.guessnumController.guessnumController.getacceleration);

    router.get('/english/showpersonal', controller.englishController.englishController.showpersonal);
    router.get('/english/updateposition', controller.englishController.englishController.updateposition);
    router.get('/english/signin', controller.englishController.englishController.signin);
    router.get('/english/develop', controller.englishController.englishController.develop);
    router.get('/english/speechlevelup', controller.englishController.englishController.speechlevelup);
    router.get('/english/getfriendrankinglist', controller.englishController.englishController.getfriendrankinglist);
    router.get('/english/getworldrankinglist', controller.englishController.englishController.getworldrankinglist);



    router.get('/english/english', io.controller.englishIOController.englishIOController.ranking);


    io.of('/english').route('ranking', io.controller.englishIOController.englishIOController.ranking);
    io.of('/english').route('cancelmatch', io.controller.englishIOController.englishIOController.cancelmatch);
    io.of('/english').route('roundend', io.controller.englishIOController.englishIOController.roundend);
    io.of('/english').route('pkend', io.controller.englishIOController.englishIOController.pkend);
    io.of('/english').route('joinroom', io.controller.englishIOController.englishIOController.joinroom);
    io.of('/english').route('leaveroom', io.controller.englishIOController.englishIOController.leaveroom);
};
