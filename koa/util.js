module.exports = {
  checkAPI(ctx) {
    if (ctx.errors) {
      throw JSON.stringify(ctx.errors);
    }
  },
  // 校验 SSO 用户状态
  checkSSOUserStatus(ctx) {
    if (!ctx.session || !ctx.session.ssoUser) {
      // session 找不到 SSO 用户信息时，需要用户重新登录
      let err = new Error('Unauthorized');
      err.status = constant.CODE.UNAUTHORIZED;
      throw err;
    }
  },
};
