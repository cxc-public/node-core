const jsSHA = require('jssha');
const koa2Req = require('koa2-request');

/**
 * 生成随机字符串
 */
const createNonceStr = function() {
  return Math.random()
    .toString(36)
    .substr(2, 15);
};

/**
 * 生成随机时间戳
 */
const createTimestamp = function() {
  return parseInt(new Date().getTime() / 1000) + '';
};

const raw = function(args) {
  let keys = Object.keys(args);
  keys = keys.sort();
  let newArgs = {};
  keys.forEach(function(key) {
    newArgs[key.toLowerCase()] = args[key];
  });

  let string = '';
  for (let k in newArgs) {
    string += '&' + k + '=' + newArgs[k];
  }
  string = string.substr(1);
  return string;
};

/**
 * 生成签名
 * @param jsapi_ticket 用于签名的 jsapi_ticket
 * @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
 *
 * @returns
 */
const sign = function(jsapiTicket, url) {
  let ret = {
    jsapi_ticket: jsapiTicket,
    nonceStr: createNonceStr(), // 注意 nonceStr 的大小写
    timestamp: createTimestamp(),
    url: decodeURIComponent(url),
  };
  let string = raw(ret);
  let shaObj = new jsSHA(string, 'TEXT');
  ret.signature = shaObj.getHash('SHA-1', 'HEX');

  return ret;
};

/**
 * 获取 token
 * @param {*} appid
 * @param {*} secret
 */
const getToken = async function(appid, secret) {
  let url = 'https://api.weixin.qq.com/cgi-bin/token';

  let res = await koa2Req(url, {
    qs: {
      appid,
      secret,
      grant_type: 'client_credential',
    },
  });
  let accessToken = JSON.parse(res.body).access_token;

  if (!accessToken) {
    throw new Error('获取 access_token 失败');
  }
  return accessToken;
};

/**
 * 获取 ticket
 * @param {*} accessToken
 */
const getTicket = async function(accessToken) {
  let url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket';

  let res = await koa2Req(url, {
    qs: {
      access_token: accessToken,
      type: 'jsapi',
    },
  });
  let ticket = JSON.parse(res.body).ticket;

  if (!ticket) {
    throw new Error('获取 jsapi_ticket 失败');
  }
  return ticket;
};

/**
 * 获取微信用户信息
 * @param {*} accessToken
 * @param {*} openid
 */
const getUserInfo = async function(accessToken, openid) {
  let url = 'https://api.weixin.qq.com/cgi-bin/user/info';

  let res = await koa2Req(url, {
    qs: {
      access_token: accessToken,
      openid,
      lang: 'zh_CN',
    },
  });
  let userInfo = JSON.parse(res.body);

  if (!userInfo || userInfo.errcode) {
    throw new Error('获取微信用户信息失败');
  }
  return userInfo;
};

module.exports = {
  sign,
  getToken,
  getTicket,
  getUserInfo,
};
