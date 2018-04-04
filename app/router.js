

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {

    const {router, controller, io} = app;
    const routerUserInfo = app.middleware.routerUserInfo({});

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
    router.get('/player/signinfo', controller.travelController.playerController.signinfo);
    router.get('/player/tosign', controller.travelController.playerController.tosign);
    router.get('/player/travelfootprint', controller.travelController.playerController.travelfootprint);
    router.get('/player/modifyrealinfo', controller.travelController.playerController.setrealinfo);
    router.get('/player/getrealinfo', controller.travelController.playerController.getrealinfo);
    router.get('/player/shareinfo', controller.travelController.playerController.shareInfo);

    router.get('/postcard/mypostcards', controller.travelController.playerController.showmypostcards);
    router.get('/postcard/citypostcards', controller.travelController.playerController.showcitypostcards);
    router.get('/postcard/detailpostcard', controller.travelController.playerController.showdetailpostcard);
    router.get('/postcard/sendpostcard', controller.travelController.playerController.sendpostcard);
    router.get('/message/getmessage', controller.travelController.playerController.getmessage);
    router.get('/message/checkmsgcnt', controller.travelController.playerController.checkmsgcnt);
    router.get('/message/clearmsg', controller.travelController.playerController.clearmsg);
    router.get('/rank/rankinfo', controller.travelController.playerController.getrankinfo);



    router.get('/travel/indexinfo', controller.travelController.travelController.index);
    router.get('/startGame/flyinfo', controller.travelController.travelController.selectcity);
    router.get('/startGame/startgame', controller.travelController.travelController.visit);
    router.get('/travel/travellog', controller.travelController.travelController.gettravellog);
    router.get('/city/citylistper', controller.travelController.travelController.getcitycompletionlist);


    router.get('/integralShop/getuserlocation', controller.travelController.integralShopController.getuserlocation);
    router.get('/integralShop/exchangeshop', controller.travelController.integralShopController.exchangeshop);
    router.get('/integralShop/integralshop', controller.travelController.integralShopController.integralshop);
    router.get('/integralShop/exchangedetail', controller.travelController.integralShopController.exchangedetail);
    router.get('/integralShop/initExchangeDetails', controller.travelController.integralShopController.initExchangeDetails);//test

    router.get('/post/postlist', controller.travelController.strategyController.gettravelstrategy);
    router.get('/post/postcomments', controller.travelController.strategyController.getcomments);
    router.get('/post/thumbcomment', controller.travelController.strategyController.givethumbsup);
    router.get('/post/commentpost', controller.travelController.strategyController.sendcomment);

    //游玩界面
    router.get('/tour/tourindexinfo', routerUserInfo,  controller.travelController.tourController.tourindexinfo);
    router.get('/tour/changerouter',  routerUserInfo,  controller.travelController.tourController.changerouter);
    router.get('/tour/questenterspot',routerUserInfo,  controller.travelController.tourController.questenterspot);
    router.get('/tour/questrandom',   routerUserInfo,  controller.travelController.tourController.questrandom);
    router.get('/tour/questrandomlist', routerUserInfo, controller.travelController.tourController.questrandomlist);
    router.get('/tour/showquestreport', routerUserInfo, controller.travelController.tourController.showquestreport);
    router.get('/tour/leavetour', routerUserInfo, controller.travelController.tourController.leavetour);

    router.get('/specialty/cityspes', controller.travelController.specialtyController.cityspes);
    router.get('/specialty/myspes', controller.travelController.specialtyController.myspes);
    router.get('/specialty/buyspe', controller.travelController.specialtyController.buy);
    router.get('/specialty/sellspe', controller.travelController.specialtyController.sell);

    io.of('/travel').route('testsend', io.controller.travelIOController.travelIOController.test);
};
