/**
 * 设置 Node 全局变量，方便业务层调用
 */

const path = require('path');
const lodash = require('lodash');
const slash = require('slash');
const log = require('../util/log');
const config = require('../common/config');

module.exports = {
  init(appPath, appName, projectName) {
    const util = require('./util');
    const constant = require(path.join(appPath, '../config/constant'));
    const deployConfig = require(path.join(appPath, '../log/deploy-config.json'));
    const logger = log.logger(path.join(appPath, '../log/'));

    const db = require('../common/db').init(appPath);

    // 基础的全局变量
    global._ = lodash;
    global.APP = {
      config,
      constant,
      util,
      db,
      logger,
      appName, // 业务中有用到
      deployConfig,
    };
  },
  setRV(customVariables) {
    // 自定义的模板渲染函数
    global.rv = (ctx, variables) => {
      let defaultVariables = {
        serverData: {
          STATIC_HOST: config.STATIC_HOST,
          version: global.APP.deployConfig[`${global.APP.appName}-version`],
        },
      };
      if (ctx.session) {
        defaultVariables.session = ctx.session;
      }
      let globalVariables = Object.assign(defaultVariables, customVariables || {});
      return Object.assign(globalVariables, variables || {});
    };
  },
};
