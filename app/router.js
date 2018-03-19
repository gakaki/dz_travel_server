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
    router.get('/english/getseason', controller.englishController.englishController.getseason);
    router.get('/english/updateposition', controller.englishController.englishController.updateposition);
    router.get('/english/signin', controller.englishController.englishController.signin);
    router.get('/english/getshareaward', controller.englishController.englishController.getshareaward);
    router.get('/english/develop', controller.englishController.englishController.develop);
    router.get('/english/speechlevelup', controller.englishController.englishController.speechlevelup);
    router.get('/english/getfriendrankinglist', controller.englishController.englishController.getfriendrankinglist);
    router.get('/english/getworldrankinglist', controller.englishController.englishController.getworldrankinglist);
    router.get('/english/roomisexist', controller.englishController.englishController.roomisexist);
    router.get('/english/makesurprise', controller.englishController.englishController.makesurprise);
    router.get('/english/canshare', controller.englishController.englishController.canshare);
    router.get('/english/isfirstsign', controller.englishController.englishController.isfirstsign);
    router.get('/english/canmatch', controller.englishController.englishController.canmatch);
    router.get('/english/checkroom', controller.englishController.englishController.checkroom);
    router.get('/english/setquestions', controller.englishController.englishController.setquestions);



    io.of('/english').route('ranking', io.controller.englishIOController.englishIOController.ranking);
    io.of('/english').route('cancelmatch', io.controller.englishIOController.englishIOController.cancelmatch);
    io.of('/english').route('roundend', io.controller.englishIOController.englishIOController.roundend);
    io.of('/english').route('joinroom', io.controller.englishIOController.englishIOController.joinroom);
    io.of('/english').route('startgame', io.controller.englishIOController.englishIOController.startgame);
    io.of('/english').route('leaveroom', io.controller.englishIOController.englishIOController.leaveroom);
    io.of('/english').route('getroominfo', io.controller.englishIOController.englishIOController.getroominfo);
    io.of('/english').route('getmatchinfo', io.controller.englishIOController.englishIOController.getmatchinfo);
    io.of('/english').route('getpkinfo', io.controller.englishIOController.englishIOController.getpkinfo);
    io.of('/english').route('roomisexist', io.controller.englishIOController.englishIOController.roomisexist);

};
