/**
 * 组装路由
 */
const koaRouter = require('koa-router');
const string = require('../util/string');
const path = require('path');

module.exports = {
  init(appPath) {
    let routerConfig = require(path.join(appPath, `./router`));
    let pageRouter = this.setPageRouter(appPath, routerConfig);
    let apiRouterGroup = this.setAPIRouter(appPath, routerConfig);

    let allRouter = koaRouter();
    allRouter.use('/', pageRouter.routes(), pageRouter.allowedMethods());
    apiRouterGroup.forEach(apiRouter => {
      allRouter.use('/api', apiRouter.routes(), apiRouter.allowedMethods());
    });

    return allRouter;
  },
  setPageRouter(appPath, routerConfig) {
    let pageKoaRouter = koaRouter();
    let routerModule = routerConfig.routerModule;
    let routerMap = routerConfig.routerMap;
    // 批量配置页面路由
    let pageRouter = null;
    _.forOwn(routerMap, function(routers, k) {
      let controllerName = k;
      let controller = require(path.join(appPath, `./controller/${controllerName}`));
      _.forOwn(routers, function(r) {
        let _router = pageRouter ? pageRouter : pageKoaRouter;
        let method = r.method || 'get';
        let prefix = routerModule[controllerName] ? routerModule[controllerName] + '/' : '';
        pageRouter = _router[method](prefix + controllerName + r.path, controller[r.action]);
        if (controllerName === routerConfig.rootController) {
          // 配置根控制器处理跟路由逻辑
          let _path = r.path.replace('/', '');
          pageRouter = pageRouter[method](_path, controller[r.action]);
        }
      });
    });

    return pageRouter;
  },
  setAPIRouter(appPath, routerConfig) {
    const config = require(path.join(appPath, './config'));
    let modelList = require(path.join(appPath, '../config/model-list'));
    let apiList = [];

    modelList.forEach(model => {
      // model 名字的驼峰法命名转为 api 文件的中划线命名
      let apiFileName = string.camelCase2Strike(model);
      apiList.push(apiFileName);
    });

    let apiRouterGroup = [];

    const apiVersion = config.API_VERSION_LIST || [
      {
        version: 'v1',
        extra: [],
      },
    ];
    apiVersion.forEach(item => {
      let apiRouter = koaRouter();
      // restful API 版本号
      apiRouter.prefix(`/${item.version}/`);
      const list = apiList.concat(item.extra);
      list.forEach(api => {
        try {
          let apiController = require(path.join(appPath, `./api/${item.version}/${api}`));
          if (apiController.list) {
            apiRouter = apiRouter.get(`/${api}/`, apiController.list);
          }
          if (apiController.fetch) {
            apiRouter = apiRouter.get(`/${api}/:id(\\d+)/`, apiController.fetch);
          }
          if (apiController.add) {
            apiRouter = apiRouter.post(`/${api}/`, apiController.add);
          }
          if (apiController.update) {
            apiRouter = apiRouter.put(`/${api}/:id(\\d+)/`, apiController.update);
          }
          if (apiController.remove) {
            apiRouter = apiRouter.delete(`/${api}/:id(\\d+)/`, apiController.remove);
          }
        } catch (error) {
          //
        }
      });

      apiRouterGroup.push(apiRouter);
    });
    return apiRouterGroup;
  },
};
