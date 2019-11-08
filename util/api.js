const restfulFilter = require('restful-filter');

module.exports = {
  getApiParams(queryParams) {
    let filter = restfulFilter({
      case_sensitive: false, // false by default, this is just example
      page_param_name: 'page',
      limit_param_name: 'count',
      per_page: 20,
      max_count_per_page: 10000,
      order_param_name: 'order_by',
    });

    let searchParams = filter.parse(queryParams).filter || [];
    let orderParams = filter.parse(queryParams).order;
    let paginationParams = filter.parse(queryParams).paginate;

    let whereParams = {}; // 组装 ORM 查询参数
    searchParams.forEach(element => {
      whereParams[element.column] = {
        [element.operator]: element.value,
      };
    });

    return {
      orderParams,
      paginationParams,
      whereParams,
    };
  },
};
