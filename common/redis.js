/**
 * redis 客户端
 */
const redis = require('redis');
const bluebird = require('bluebird');
const path = require('path');
const log = require('../util/log');

const NODE_ENV = process.env.NODE_ENV || 'development';

const init = appPath => {
  const config = require(path.join(appPath, '../config/app'));
  if (!config || !config.REDIS) {
    return;
  }
  /**
   * redis 配置 {
   * host - Redis服务器的IP地址。默认值为：127.0.0.1
   * port - Redis服务器的端口。默认值为：6379
   * path - Redis服务器的UNIX套接字路径。默认为：null
   * parser - 使用内置的JS解析或使用hiredis解析，在< 2.6的版本中hiredis会默认被安装。默认为：null
   * string_numbers - 设置为true时会返回Redis数字字符串代替JavaScript数字字符串。默认为：null
   * return_buffers - 设置为true时会向回调函数返回Buffer而不是字符串。默认为：false
   * detect_buffers - 设置为true时会向回调函数返回Buffer而不是字符串，不同于return_buffers，这个参数会针对每一个命令的基础上进行Buffer和字符串之间进行转换。默认为：false
   * socket_keepalive - 设置为true时，会保持socket套接字的连接。默认为：true
   * no_ready_check - 当建立到Redis 服务器的连接时，仍可以从磁盘加载数据，加载时服务器不会响应任何命令。为了解决这个问题，node_redis会向服务器发送一个INFO命令以检查服务器的状态。默认为：false
   * enable_offline_queue - 默认情况下，当Redis 服务器没有活跃的连接时，这个命令会被添加到队列且会立即执行；当此选项设置为false时，会禁用此功能。默认为：true
   * retry_max_delay - 默认情况下，客户端会在上次失败后延时一倍时间再次尝试重连，此选项用于设置尝试重连的时候。默认为：null
   * max_attempts - 此选项用于设置客户端连接和重新连接的时间。默认为：3600000
   * connect_timeout - 不再使用，请用retry_strategy选项替代
   * retry_unfulfilled_commands - 设置为true时，所有未实现的命令会重新连接后重试。默认为：true
   * password - 用于Redis 服务器验证的密码，别名auth_pass。在< 2.5的版本中必须使用auth_pass。默认为：null
   * db - 设置后会在连接时执行select命令连接到指定数据库。默认为：null
   * family - 连接Redis服务器使用的IP协议族，参见Node.js的net模块和nds模块相关介绍。默认为：IPv4
   * disable_resubscribing - 设置为true时，客户端断开连接后不会重新订阅。默认为：false
   * rename_commands - 传入一个对象，对Redis 命令进行重命名。默认为：null
   * tls - 设置连接到Redis 服务器的TLS连接。默认为：null
   * prefix - 设置键的前缀。默认为：null
   * retry_strategy - 一个包含attempt选项的函数，total_retry_time选项会标识重试的次数。默认为：function}
   */
  let client = redis.createClient({
    host: config.REDIS.RDS_HOST,
    port: config.REDIS.RDS_PORT,
    password: config.REDIS.RDS_PASS,
    db: config.REDIS.RDS_DB,
  });
  client.on('connect', () => {
    if (NODE_ENV === 'development') {
      // 生产环境无需写 redis 连接记录，减轻服务器压力
      let logger = log.logger(path.join(appPath, '../log/'));
      logger.info(`The redis-client connection (${config.REDIS.RDS_HOST}:${config.REDIS.RDS_PORT}) is successful !`);
    }
  });
  client.on('error', err => {
    let logger = log.logger(path.join(appPath, '../log/'));
    logger.error(`Redis ERROR ! ${err}`);
  });
  bluebird.promisifyAll(redis.RedisClient.prototype);
  bluebird.promisifyAll(redis.Multi.prototype);
  return client;
};

module.exports = {
  init,
};
