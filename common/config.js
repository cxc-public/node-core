/**
 * 公用配置文件
 */

const NODE_ENV = process.env.NODE_ENV || 'development';

const _config = {
  development: {},
  test: {},
  staging: {},
  production: {},
};

// 管理端用于安全通讯的 Token
let adminToken = 'cRidJ16LpXqMoixx3E';

if (NODE_ENV === 'production') {
  adminToken = require('/secure/config.json').token;
}
if (!adminToken) {
  throw new Error(`管理端用于安全通讯的 Token 异常`);
}

const config = {
  // Token
  ADMIN_TOKEN: adminToken,
  // 其他
  MAGIC_SMS_CODE: '2018',
  MAGIC_EMAIL_CODE: '2018',
  PAGESIZE: 10,
  PAGE_VISIABLE_COUNT: 15,
};

module.exports = config;
