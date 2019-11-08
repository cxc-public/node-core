module.exports = {
  // 生成分页 HTML 片段
  generatePigination: function(query, pageSize, pageVisiableCount, pageNum, totalCount) {
    pageNum = pageNum || 1;

    let paginationQuery = [];
    Object.keys(query).forEach(function(k) {
      if (k !== 'p') {
        paginationQuery.push(k + '=' + query[k]);
      }
    });

    if (paginationQuery.length) {
      paginationQuery = paginationQuery.join('&');
      paginationQuery = '&' + paginationQuery;
    }

    let pageTotalCount = Math.floor((totalCount - 1) / pageSize) + 1; // 页码总数
    let prevNum = pageNum - 1;
    let nextNum = pageNum + 1;

    pageNum = Math.min(pageNum, pageTotalCount); // 页码不能超过总页码

    let pagination = [];

    if (totalCount > 0) {
      pagination.push('<div class="pagination">');
      if (prevNum > 0) {
        pagination.push(`<a href="?p=1${paginationQuery}">&lt;&lt;</a>`);
        pagination.push(`<a href="?p=${prevNum}${paginationQuery}">上一页</a>`);
      }
      for (let i = 0; i < pageTotalCount; i++) {
        if (i + 1 <= pageNum + pageVisiableCount / 2 && i + 1 >= pageNum - pageVisiableCount / 2) {
          pagination.push(
            `<a href="?p=${i + 1}${paginationQuery}" class="${pageNum === i + 1 ? 'active' : ''}">${i + 1}</a>`
          );
        }
      }
      if (nextNum <= pageTotalCount) {
        pagination.push(`<a href="?p=${nextNum}${paginationQuery}">下一页</a>`);
        pagination.push(`<a href="?p=${pageTotalCount}${paginationQuery}">&gt;&gt;</a>`);
      }
      pagination.push(`<span class="page-count">共 ${pageTotalCount} 页</span>`);
      pagination.push('</div>');
    }
    pagination = pagination.join('');
    return pagination;
  },
};
