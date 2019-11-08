const crypto = require('crypto');
const md5 = require('md5');

module.exports = {
  // 生成加密后的密码
  generatePW: password => {
    return md5(password);
  },
  // 根据 key 生成 secret
  getAppSecret: key => {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(Date.now().toString());
    return hmac.digest('hex');
  },
  // 随机生成一个 MD5 字符串
  generateRandomSecret: () => {
    return md5(new Date().getTime() + Math.floor(Math.random() * 10000));
  },
  /**
   * 解码微信退款结果
   */
  decodeWechatRefundResult: (key, data) => {
    /**
     * 解密步骤：
     * 1、对加密串 A 做b ase64 解码，得到加密串 B；
     * 2、对商户 key 做 md5，得到 32 位小写 key*
     * 3、用 key* 对加密串 B 做 AES-256-ECB 解密（PKCS7Padding）
     */

    key = md5(key);
    let iv = '';
    let inputEncoding = 'base64';
    let outputEncoding = 'utf8';
    let decipherChunks = '';
    let decipher = crypto.createDecipheriv('aes-256-ecb', key, iv);

    decipher.setAutoPadding(true);
    decipherChunks = decipher.update(data, inputEncoding, outputEncoding);
    decipherChunks += decipher.final(outputEncoding);

    return decipherChunks; // xml 个数
  },
};
