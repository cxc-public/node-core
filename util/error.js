module.exports = {
  getCtxMsg(ctx) {
    return `\nURL: ${ctx.origin + ctx.url}\nMETHOD: ${ctx.method}\nCTX_STATE: ${JSON.stringify(
      ctx.state
    )}\nCLIENT_INFO: ${ctx.headers['client-info']}\nPOST_DATA: ${JSON.stringify(ctx.request.body)}`;

  },
  formatError(ctx, err, length) {
    let error = `${JSON.stringify(err, Object.getOwnPropertyNames(err)).replace(/\\n/g, '\n')}`;
    if (length) {
      error = error.substr(0, length);
    }
    return `${this.getCtxMsg(ctx)} \n------\n ${error}`;
  },
};
