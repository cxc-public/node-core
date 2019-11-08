const Logger = require('mini-logger');
const log4js = require('log4js');
const path = require('path');
const file = require('./file');

module.exports = {
  logger: function(logDir) {
    let logger = Logger({
      dir: logDir,
      categories: ['error', 'http', 'sql', 'info'],
      mkdir: true,
      timestamp: true,
      flushInterval: 1000,
      format: 'YYYY-MM-DD-[{category}][.log]',
    });
    return logger;
  },
  logRouter: function(router, filePath, filename) {
    let routerList = [];
    router.stack.map(function(v) {
      v.methods.length &&
        routerList.push({
          path: v.path,
          method: v.methods,
        });
    });
    // 把当前路由表写入日志，方便调试排查问题
    file.writeFile(filePath, filename, `${JSON.stringify(routerList)}`);
  },
  logstash: function(appPath) {
    const config = require(path.join(appPath, '../config/app'));
    if (config.LOG_LOGSTASH) {
      log4js.configure({
        appenders: {
          logstash: {
            type: '@log4js-node/logstash-http',
            url: config.LOG_LOGSTASH,
            application: 'logstash-log4js',
            logType: 'application',
            logChannel: 'node',
            timeout: config.LOG_LOGSTASH_TIMEOUT,
          },
        },
        categories: {
          default: { appenders: ['logstash'], level: config.LOG_LOGSTASH_LEVEL },
        },
      });
      const logger = log4js.getLogger();
      return logger;
    }
  },
};
