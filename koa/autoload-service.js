/**
 * 自动加载全部 service
 */

const path = require('path');
const string = require('../util/string');

module.exports = {
  init(appPath) {
    const config = require(path.join(appPath, './config'));
    const modelList = require(path.join(appPath, '../config/model-list'));
    const baseService = require('./model-base-service');

    modelList.forEach(model => {
      // model 名字的驼峰法命名转为 service 文件的中划线命名
      let serviceFileName = string.camelCase2Strike(model);

      let serviceName = model + 'Service';
      // 此处要注意不能覆盖 global 可能已存在的变量
      if (global[serviceName]) {
        throw new Error(`Node 全局已存在 ${serviceName} 变量`);
      }

      try {
        global[serviceName] = require(path.join(appPath, `./service/${serviceFileName}`));

        for (const key in baseService) {
          if (baseService.hasOwnProperty(key)) {
            // 只有当 service 没有此方法时，才退而取 base 的方法，也就是具体 service 文件的方法优先级高
            global[serviceName][key] = global[serviceName][key] || baseService[key](global[model]);
          }
        }
      } catch (error) {
        //
      }
    });

    const extraServiceList = config.EXTRA_SERVICE || [];
    extraServiceList.forEach(item => {
      // item 名字的驼峰法命名转为 service 文件的中划线命名
      let serviceFileName = string.camelCase2Strike(item);

      let serviceName = item + 'Service';
      // 此处要注意不能覆盖 global 可能已存在的变量
      if (global[serviceName]) {
        throw new Error(`Node 全局已存在 ${serviceName} 变量`);
      }

      try {
        global[serviceName] = require(path.join(appPath, `./service/_${serviceFileName}`));
      } catch (error) {
        //
      }
    });
  },
};
