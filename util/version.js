const path = require('path');
const mkdir = require('mkdirp-sync');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const number = require('./number');

module.exports = {
  /**
   * 更新部署版本号
   */
  update: function(logPath, appName) {
    mkdir(logPath);

    let adapter = new FileSync(path.join(logPath, 'deploy-config.json'));
    let db = low(adapter);

    if (!appName) {
      throw new Error(`更新项目版本时未指定项目`);
    }

    db.set(`${appName}-version`, number.generate4RandomNumber()).write();
  },
};
