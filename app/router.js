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





    router.get('/player/playerinfo', controller.travelController.playerController.showplayerinfo);
    router.get('/player/lookticket', controller.travelController.playerController.showflyticket);
    router.get('/travel/modifyrealinfo', controller.travelController.playerController.setrealinfo);
    router.get('/travel/getrealinfo', controller.travelController.playerController.getrealinfo);
    router.get('/postcard/mypostcards', controller.travelController.playerController.showmypostcards);
    router.get('/postcard/citypostcards', controller.travelController.playerController.showcitypostcards);
    router.get('/postcard/detailpostcard', controller.travelController.playerController.showdetailpostcard);
    router.get('/postcard/sendpostcard', controller.travelController.playerController.sendpostcard);


    router.get('/travel/indexinfo', controller.travelController.travelController.index);
    router.get('/startGame/flyinfo', controller.travelController.travelController.selectcity);
    router.get('/travel/startgame', controller.travelController.travelController.visit);
    router.get('/travel/travellog', controller.travelController.travelController.gettravellog);



};
