/**
 * koa app 实例公用逻辑
 */

const path = require('path');
const Koa = require('koa');
const koaStatic = require('koa-static');
const xmlBodyParser = require('koa-xml-body');
const bodyParser = require('koa-bodyparser');
const formidable = require('koa2-formidable');
const koaLogger = require('koa-logger');
const koaValidate = require('koa-validate');
const nj = require('koa2-nunjucks');
const jwt = require('koa-jwt');
const cors = require('koa2-cors');
const session = require('koa-session-minimal');
const MysqlStore = require('koa-mysql-session');
const isRegex = require('is-regex');
const matcher = require('matcher');
const appRouter = require('./router');
const autoLoadModel = require('./autoload-model');
const autoLoadService = require('./autoload-service');
const ua = require('../util/ua');
const api = require('../util/api');
const log = require('../util/log');
const error = require('../util/error');
const acl = require('koa-2-acl');
// const easyMonitor = require('easy-monitor');
const globalVariable = require('./global-variable');
const NODE_ENV = process.env.NODE_ENV || 'development';

// 设置基本的全局变量
const setBaseGlobalVariable = (appPath, projectName, appName) => {
  globalVariable.init(appPath, appName, projectName);
};

// 设置应用监控页面
// const setEasyMonitor = (projectName, appName) => {
//   easyMonitor({
//     project_name: `${projectName}/${projectName}-${APP.appName}`,
//     log_level: 0,
//     http: {
//       prefix: '/monitor',
//     },
//     auth: {
//       need: true,
//       /**
//        @param {string} user 用户名
//        @param {string} pass 用户键入密码
//        @return {promise}
//        **/
//       authentication(user, pass) {
//         return new Promise(resolve => {
//           if (user === 'admin1' && pass === '1234') resolve(true);
//           else resolve(false);
//         });
//       },
//     },
//   });
// };

// 根据配置初始化 APP 实例
const init = ({
  appPath,
  isUseSession,
  isUseJWT,
  isUseACL,
  isUseFormidable,
  loginUnlessPaths,
  jwtUnlessPaths,
  customJwtUnlessPaths,
}) => {
  const config = require(path.join(appPath, './config'));
  const app = new Koa();
  // 载入 model
  autoLoadModel.init(appPath);

  // 载入路由
  let router = appRouter.init(appPath);
  // 载入 service
  autoLoadService.init(appPath);

  // 开启请求参数校验
  koaValidate(app);

  if (isUseSession) {
    const dbConfig = require(path.join(appPath, '../config/db'));
    // session 存储配置
    const sessionMysqlConfig = {
      user: dbConfig[NODE_ENV].username,
      password: dbConfig[NODE_ENV].password,
      database: dbConfig[NODE_ENV].database,
      host: dbConfig[NODE_ENV].host,
    };

    let store = new MysqlStore(sessionMysqlConfig);

    // 配置 session 中间件
    app.use(
      session({
        key: 'SESSION_ID',
        cookie: {
          maxAge: 30 * 24 * 60 * 60 * 1000, // cookie 有效时长 30 天，单位毫秒
        },
        store,
      })
    );
  }

  // path 统一添加尾随 slash
  // 对于代码中要用到链接的地方，必须要尾随 slash，避免无谓的重定向消耗资源
  app.use(async (ctx, next) => {
    // 排除有后缀的链接，比如图片、视频等静态资源，无需尾随 slash
    if (ctx.path.substr(-1) !== '/' && ctx.path.indexOf('.') === -1) {
      ctx.redirect(ctx.path + '/');
    } else {
      await next();
    }
  });

  // const routerPc2MMap = require(path.join(appPath, '../config/router-pc2m-map'));
  // // UA 映射跳转
  // app.use(async (ctx, next) => {
  //   let uaName = null;
  //   if (ctx.request.headers['user-agent']) {
  //     uaName = ctx.request.headers['user-agent'].toLowerCase();
  //   }

  //   if (APP.appName === 'pc' && ua.isMobile(uaName)) {
  //     routerPc2MMap.mapList.forEach(map => {
  //       if (map.pc.test(ctx.path)) {
  //         // 映射动态参数
  //         let matchRes = ctx.path.match(map.pc);
  //         let id1 = matchRes[1];
  //         let id2 = matchRes[2];
  //         let id3 = matchRes[3]; // 目前最多支持三个动态参数

  //         let mPath = map.m; // 不能重写 map.m
  //         mPath = mPath.replace(':id1', id1);
  //         mPath = mPath.replace(':id2', id2);
  //         mPath = mPath.replace(':id3', id3);

  //         let queryString = [];
  //         // 映射 query
  //         if (map.query) {
  //           map.query.forEach(q => {
  //             if (!ctx.query[q.pc]) {
  //               return;
  //             }
  //             queryString.push(`${q.m}=${encodeURIComponent(ctx.query[q.pc])}`);
  //           });
  //         }
  //         // 补充 fixedQuery
  //         if (map.fixedQuery) {
  //           map.fixedQuery.forEach(q => {
  //             queryString.push(`${q.key}=${q.value}`);
  //           });
  //         }
  //         let mURL = `//${config.MOBILE_HOST}${mPath}?${queryString.join('&')}`;
  //         ctx.redirect(mURL);
  //       }
  //     });
  //   }
  //   await next();
  // });

  // 统一接收 API 查询参数
  app.use(async (ctx, next) => {
    if (/^\/api\//.test(ctx.url)) {
      let apiParams = api.getApiParams(ctx.query);
      ctx.state = _.extend(ctx.state, apiParams);
    }
    await next();
  });

  if (NODE_ENV === 'development') {
    // 访问日志
    app.use(async (ctx, next) => {
      await next();
      APP.logger.http(error.getCtxMsg(ctx));
    });
  }

  // 处理 404 请求和脚本错误
  app.use(async (ctx, next) => {
    let isAPI = /^\/api\//.test(ctx.url);
    try {
      await next();
      if (isAPI) {
        // API 做特殊处理
        if (ctx.status === APP.constant.CODE.NOT_FOUND) {
          // 404 请求
          ctx.status = APP.constant.CODE.NOT_FOUND;
          ctx.body = {
            data: null,
            code: ctx.status,
            msg: APP.constant.MSG.NOT_FOUND,
          };
        } else if (ctx.status === 200) {
          // 正常成功请求
          // 成功的请求，默认都是 200 状态码，需要手动调整以适配 restful API
          ctx.status = APP.constant.CODE[ctx.method];
          if (!ctx.body) {
            ctx.body = {};
          }
          ctx.body.code = ctx.status;
          ctx.body.msg = APP.constant.MSG.SUCCESS;
          ctx.body.success = true;
        } else {
          // 未知状态使用该状态的默认处理即可
          ctx.status = ctx.status;
        }
        if (ctx.body) {
          ctx.body.at = new Date().toLocaleString();
        }
      } else {
        // 非 API
        if (ctx.status === APP.constant.CODE.NOT_FOUND) {
          ctx.redirect('/service/404/');
        } else if (ctx.status === APP.constant.CODE.FORBIDDEN) {
          // 未授权
          ctx.redirect('/service/forbidden/');
        }
      }
    } catch (err) {
      if (isAPI) {
        // API 做特殊处理
        if (err.status === APP.constant.CODE.UNAUTHORIZED) {
          // 未认证
          ctx.status = APP.constant.CODE.UNAUTHORIZED;
          ctx.body = {
            data: null,
            code: ctx.status,
            msg: APP.constant.MSG.UNAUTHORIZED,
          };
        } else {
          // 其他未知错误
          ctx.status = APP.constant.CODE.SERVER_ERROR;
          ctx.body = {
            data: null,
            code: ctx.status,
            msg: err + '',
          };
        }
        if (ctx.body) {
          ctx.body.at = new Date().toLocaleString();
        }
      } else {
        // 非 API
        if (err.status === APP.constant.CODE.UNAUTHORIZED) {
          // 未认证
          ctx.redirect('/system/login/');
        } else {
          // 其他未知错误
          if (APP.appName === 'admin') {
            ctx.session.serverErrorMsg = error.formatError(ctx, err);
          }
          ctx.redirect('/service/error/');
        }
      }
      // 记录错误
      APP.logger.error(error.formatError(ctx, err));
    }
  });

  // 配置控制台日志中间件
  app.use(koaLogger());

  // xml parser
  app.use(xmlBodyParser());

  if (isUseFormidable) {
    // @see https://github.com/koajs/bodyparser/issues/85
    app.use(formidable());
  }
  // 配置 ctx.body 解析中间件
  app.use(
    bodyParser({
      // @see https://github.com/koajs/bodyparser
      formLimit: '200kb',
    })
  );

  // 配置静态资源加载中间件
  app.use(koaStatic(path.join(appPath, './../public')));

  // 配置服务端模板渲染引擎中间件
  app.use(
    nj({
      debug: true, // default: false
      ext: 'html', // default: 'html'
      path: path.join(appPath, './view'), // default: './'
      njConfig: {
        watch: true,
        /* Config Options */
      },
    })
  );

  /**
   * 允许 js 跨域请求
   */
  app.use(
    cors({
      origin: function(ctx) {
        return '*';
      },
    })
  );

  if (isUseSession) {
    // 登录态判断
    app.use(async (ctx, next) => {
      let unlessPaths = loginUnlessPaths;
      let isUnlessPath = false;

      unlessPaths.forEach(path => {
        if (path.test(ctx.path)) {
          isUnlessPath = true;
        }
      });

      if (!ctx.session.isLogin) {
        if (!isUnlessPath) {
          if (isUseJWT && ctx.cookies.get('token')) {
            // 清除 API token
            ctx.cookies.set('token', '', {
              maxAge: 0,
            });
          }
          let err = new Error('Unauthorized');
          err.status = APP.constant.CODE.UNAUTHORIZED;
          throw err;
        }
      } else {
        ctx.request.rbacRole = ctx.session.rbacRole;
        if (isUseACL) {
          const aclConfig = require(path.join(appPath, './acl'));
          acl.config(aclConfig.getConfig(ctx.session.aclRules), {
            status: 'Access Denied',
            message: 'You are not authorized to access this resource',
          });
        }
      }
      await next();
    });
  }

  if (isUseJWT) {
    // jwt 验证过程
    app.use(
      jwt({ secret: config.JWT_SECRET }).unless({
        path: jwtUnlessPaths,
        custom: ctx => {
          let paths = customJwtUnlessPaths || [];
          return (
            paths
              .filter(path => {
                if (isRegex(path.url)) {
                  return ctx.request.path.match(new RegExp(path.url));
                }
                return matcher.isMatch(ctx.request.path, path.url);
              })
              .filter(path => {
                if (!path) {
                  return false;
                }
                // If no methods assume all should be allowed
                if (!path.methods) {
                  return path;
                }
                return path.methods.includes(ctx.request.method);
              }).length >= 1
          );
        },
      })
    );
  }

  // 设置自定义全局变量
  app.use(async (ctx, next) => {
    // let _globalVariable = require(path.join(appPath, `../config/global-variable-${APP.appName}`));
    // let data = await _globalVariable.init();
    let data = {};
    globalVariable.setRV(data);
    await next();
  });

  // 初始化路由中间件
  app.use(router.routes()).use(router.allowedMethods());

  if (NODE_ENV === 'development') {
    log.logRouter(router, path.join(appPath, '../log'), `router-${APP.appName}.json`);
  }

  // 处理所有服务器错误（未被 try catch 的错误）
  app.on('error', function(err, ctx) {
    APP.logger.error(error.formatError(ctx, err));
  });

  // 监听端口
  app.listen(config.PORT);
  console.log(`The ${NODE_ENV} server is start at port ${config.PORT}`);
};

module.exports = {
  setBaseGlobalVariable,
  // setEasyMonitor,
  init,
};
