'use strict';

const assert  = require('assert');
const kue     = require('kue');
const Job     = kue.Job;

/**
 * 接受config和app两个参数，并返回初始化一个Kue实例
 * @param  {Object} config   框架处理之后的配置项
 * @param  {Application} app 当前应用
 * @return {Object}          返回创建的 Kue 实例
 */

module.exports = app => {
  app.addSingleton('kue', createDelayedJob);
};

function createDelayedJob(config, app) {
  const { redis } = config;
  assert(redis && redis.host && redis.port && config.prefix);
  
  //这里的config其实是跟config.default.js的
  const queue = kue.createQueue(config);
  // console.log("dz kue 的插件配置 redis config is ", config);

  // kue.app.listen(5555);

  app.beforeStart(async () => {
      app.coreLogger.info('[egg-kue] instance begin start');
      try {
          let count = await Job.client.zcard(Job.client.getKey('jobs'));
          app.coreLogger.info(`[egg-kue] instance status OK, current job count is ${count}`);
          return count;
      } catch (error) {
          console.log(error);
          app.coreLogger.info(`[egg-kue] instance status Error, current job count can not fetch`);
      } finally {
          app.coreLogger.info(`[egg-kue] instance status Error, current job count can not fetch`);
      }
  });

  // app.beforeStart(function* () {
  //   const count = yield new Promise((resolve, reject) => {
  //      (err, count) => {
  //       if (err) {
  //         reject(err);
  //       }
  //       resolve(count);
  //     });
  //   });
  // });
  return queue;
}