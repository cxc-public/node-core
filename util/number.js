const moment = require('moment');

module.exports = {
  // 生成指定格式的随机数
  generateRandomNumber: function(flag) {
    let prefix = '';
    if (flag) {
      prefix = flag + '-';
    }
    return `${prefix}${moment().format('YYMMDDHHmmss')}${this.generate4RandomNumber()}`;
  },
  // 生成四位随机数（此函数不会返回 0 开头的数字，所以运算时不用考虑 0 开头的特殊情况）
  generate4RandomNumber: function() {
    return Math.floor(Math.random() * 9000) + 1000;
  },
  dataLeftCompleting: function(bits, value, identifier) {
    identifier = identifier || '0';
    value = Array(bits + 1).join(identifier) + value;
    return value.slice(-bits);
  },
  getLast4Number: function(id) {
    // 不够四位自动补全四位
    return this.dataLeftCompleting(4, (id + '').slice(-4));
  },
  getLastXNumber: function(x, id) {
    // 不够 X 位自动补全 X 位
    return this.dataLeftCompleting(x, (id + '').slice(-x));
  },
};
