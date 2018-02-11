'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index(ctx) {
      console.log("进来把");
      ctx.redirect("/user");

  }
}

module.exports = HomeController;
