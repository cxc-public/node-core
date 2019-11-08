/**
 * elasticsearch搜索
 * @Doc: https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html
 */

const elasticsearch = require('elasticsearch');
const NODE_ENV = process.env.NODE_ENV || 'development';
const config = {
  development: {
    ES_HOST: '183.6.107.237',
    ES_PORT: '9200',
  },
  test: {
    ES_HOST: '183.6.107.237',
    ES_PORT: '9200',
  },
  staging: {
    ES_HOST: '183.6.107.237',
    ES_PORT: '9200',
  },
  production: {
    ES_HOST: '47.112.107.49',
    ES_PORT: '9200',
  },
};

const hosts = `http://${config[NODE_ENV].ES_HOST}:${config[NODE_ENV].ES_PORT}`;

const es = function() {
  let client = new elasticsearch.Client({
    hosts,
  });
  // ping客户端以确保Elasticsearch已启动
  client.ping(
    {
      requestTimeout: 30000,
    },
    function(error) {
      // 此时，eastic搜索已关闭，请检查您的Elasticsearch服务
      if (error) {
        console.error('Elasticsearch cluster is down!');
      } else {
        console.log(`The elasticsearch cluster connection (${config.ES_HOST}:${config.ES_PORT}) is successful !`);
      }
    }
  );
  return client;
};

/** 新增索引 */
const createIndex = function(index) {
  index += NODE_ENV;
  let client = new elasticsearch.Client({
    hosts,
  });
  client.indices.create({ index }, function(error, response, status) {});
};

/** 将数据添加到索引 */
const setData = function({ index, id, type, body }) {
  index += NODE_ENV;
  let client = new elasticsearch.Client({
    hosts,
  });
  // 将数据添加到已创建的索引
  client.index({ index, id, type, body }, function(err, resp, status) {
    if (err) {
      console.error(`Failed Set operation: ${err}`);
    } else {
      console.log(`Set Successfully, httpStatus: ${status}`);
    }
  });
};

/** 将索引下的某ID数据删除 */
const deleteData = function({ index, id, type, body }) {
  index += NODE_ENV;
  let client = new elasticsearch.Client({
    hosts,
  });
  // 将数据添加到已创建的索引
  client.delete({ index, id, type }, function(err, resp, status) {
    if (err) {
      console.error(`Failed delete operation: ${err}`);
    } else {
      console.log(`Delete Successfully, httpStatus: ${status}`);
    }
  });
};

/** 批量将数据添加到索引 */
const bulkData = function(bulk) {
  let client = new elasticsearch.Client({
    hosts,
  });
  client.bulk({ body: bulk }, function(err, response) {
    if (err) {
      console.error(`Failed Bulk operation: ${err}`);
    } else {
      console.log(`Successfully imported ${bulk.length}`);
    }
  });
};

module.exports = {
  es,
  createIndex,
  setData,
  deleteData,
  bulkData,
};
