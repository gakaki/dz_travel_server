

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
    router.get('/player/traveledplaces', controller.travelController.playerController.traveledplaces);
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
    router.get('/startGame/createcode', controller.travelController.doubleController.createcode);
    router.get('/startGame/checkcode', controller.travelController.doubleController.checkcode);
    router.get('/startGame/partnerinfo', controller.travelController.doubleController.doubleinfo);
    router.get('/startGame/deletecode', controller.travelController.doubleController.deletecode);



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


    //游玩界面 新手引导完成标记
    router.get('/tour/checkguide',                      controller.travelController.tourController.checkguide);
    router.get('/tour/finishguide',                     controller.travelController.tourController.finishguide);

    router.get('/tour/tourindexinfor', routerUserInfo,  controller.travelController.tourController.tourindexinfor);

    //游玩界面 首页
    router.get('/tour/tourindexinfo', routerUserInfo,  controller.travelController.tourController.tourindexinfo);
    router.get('/tour/tourstart',routerUserInfo,controller.travelController.tourController.tourstart);
    //游玩界面 设置/修改路线
    router.get('/tour/setrouter',routerUserInfo,controller.travelController.tourController.setrouter);
    router.get('/tour/modifyrouter',routerUserInfo,controller.travelController.tourController.modifyrouter);
    //游玩界面 进入景点
    router.get('/tour/reqenterspot',routerUserInfo,  controller.travelController.tourController.reqenterspot);
    //游玩界面 进入景点->拍照按钮
    router.get('/tour/photography', routerUserInfo, controller.travelController.tourController.photography);
    //游玩界面 进入景点->观光按钮
    router.get('/tour/spottour', routerUserInfo, controller.travelController.tourController.spottour);
    //游玩界面 进入景点->人物点击-》显示事件（获得奖励）
    router.get('/tour/eventshow', routerUserInfo, controller.travelController.tourController.eventshow);
    //游玩界面 进入景点->人物点击-》显示事件（回答问题）-》提交
    router.get('/tour/tourspotanswer', routerUserInfo, controller.travelController.tourController.tourspotanswer);
    //游玩界面 进入景点->重选路线
    router.get('/tour/changerouter',  routerUserInfo,  controller.travelController.tourController.changerouter);
    //游玩界面 进入景点->定时获取是否有新的随机事件。
    router.get('/tour/questrandom',   routerUserInfo,  controller.travelController.tourController.questrandom);
    //游玩界面 进入景点->展示报告例如最后的最短路径效率。
    router.get('/tour/showquestreport', routerUserInfo, controller.travelController.tourController.showquestreport);
    //游玩界面 进入景点->离开游玩界面。
    router.get('/tour/leavetour', routerUserInfo, controller.travelController.tourController.leavetour);
    router.get('/tour/rentprop', routerUserInfo, controller.travelController.tourController.rentprop);
    router.get('/tour/rentedprop', routerUserInfo, controller.travelController.tourController.rentedprop);

    router.get('/speciality/cityspes', controller.travelController.specialityController.cityspes);
    router.get('/speciality/myspes', controller.travelController.specialityController.myspes);
    router.get('/speciality/buyspe', controller.travelController.specialityController.buy);
    router.get('/speciality/sellspe', controller.travelController.specialityController.sell);

    io.of('/travel').route('testsend', io.controller.travelIOController.travelIOController.test);
};
