/**
 * 受限的 model 加 hooks 做权限检验（增删改查时需要加用户身份认证）
 * 为了保证严谨的操作权限控制，所有受限的 Model 只能调用加了 hooks 的方法，目前加了 hooks 的方法包括：
 * findOne, findById, findAll, findAndCountAll, bulkCreate, create, update, destroy
 * 也就是说，受限的 Model 只能调用以上几个方法，否则就是权限不受控的
 * @see http://sequelize.readthedocs.io/en/v3/docs/hooks/
 */
const path = require('path');

const init = appPath => {
  let restrictedModelList = require(path.join(appPath, '../config/model-list-restricted'));

  restrictedModelList.forEach(model => {
    model.addHook('beforeFind', function(options) {
      if (!options.where.user_id) {
        throw new Error('查询数据时必须指定 user_id');
      }
    });
    model.addHook('beforeBulkCreate', function(instance, options, fn) {
      // 因为新增时，user_id 为非空字段，所以无需检测
    });
    /**
     * @see https://github.com/sequelize/sequelize/issues/6253
     * @description beforeUpdate hook called when use instance.save() or instance.update(), when use model.update(), beforeBulkUpdate will be called.
     */
    model.addHook('beforeBulkUpdate', function(options, fn) {
      let uid;
      let objectSymbols = Object.getOwnPropertySymbols(options.where);
      objectSymbols.forEach(item => {
        if (item.toString() === 'Symbol(and)') {
          options.where[item].forEach(val => {
            if (val.user_id) {
              uid = val.user_id;
            }
          });
        }
      });
      if (!uid) {
        throw new Error('更新数据时必须指定 user_id');
      }
    });
    /**
     * 与 beforeBulkUpdate 同理
     */
    model.addHook('beforeBulkDestroy', function(options, fn) {
      if (!options.where.user_id) {
        throw new Error('删除数据时必须指定 user_id');
      }
    });
    model.addHook('beforeCreate', function(instance, options, fn) {
      // 因为新增时，user_id 为非空字段，所以无需检测
    });
    /**
     * @see https://github.com/sequelize/sequelize/issues/6253
     */
    model.addHook('beforeUpdate', function(instance, options, fn) {
      // 暂时用不到
    });
    /**
     * @see https://github.com/sequelize/sequelize/issues/6253
     */
    model.addHook('beforeDestroy', function(instance, options, fn) {
      // 暂时用不到
    });
  });
};

module.exports = {
  init,
};
