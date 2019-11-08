/**
 * 自动加载全部 model
 */

const path = require('path');
const string = require('../util/string');

module.exports = {
  init(appPath) {
    let modelList = require(path.join(appPath, '../config/model-list'));
    let modelAttributes = require(path.join(appPath, '../config/model-attributes'));

    modelList.forEach(model => {
      // 此处要注意不能覆盖 global 可能已存在的变量
      if (global[model]) {
        throw new Error(`Node 全局已存在 ${model} 变量`);
      }
      // model 名字的驼峰法命名转为 model 文件的下划线命名
      let modelFileName = string.camelCase2UnserScore(model);
      global[model] = global.APP.db.sequelize.import(path.join(appPath, `../model/${modelFileName}`));
      let attr = modelAttributes[model];
      let baseExcludeAttributes = [`created_at`, `updated_at`, `deleted_at`];
      let modelExcludeAttr = modelAttributes[model] || baseExcludeAttributes;
      // admin 应用所有 model 都返回全部字段
      if (global.appName === 'admin') {
        modelExcludeAttr = [];
      }
      global[model].attr = modelExcludeAttr;
    });

    // admin 应用的 model 都不需要做权限检验
    if (global.appName !== 'admin') {
      // 载入 hooks
      require('./model-hooks').init(appPath);
    }

    // 载入 relation
    require(path.join(appPath, '../config/model-relation'));
  },
};
