module.exports = {
  getList(Model) {
    return async function(state, uid) {
      let where = state.whereParams;
      if (uid) {
        where.user_id = uid;
      }
      let listRes = await Model.findAndCountAll({
        where,
        order: state.orderParams,
        offset: state.paginationParams.offset,
        limit: state.paginationParams.limit,
        attributes: { exclude: Model.attr },
      });
      return listRes;
    };
  },
  getById(Model) {
    return async function(id, uid) {
      let where = {
        id,
      };
      if (uid) {
        where.user_id = uid;
      }
      let detail = await Model.findOne({
        where,
        attributes: { exclude: Model.attr },
      });
      return detail;
    };
  },
  add(Model) {
    return async function(value, checkExistedParams, errMsg) {
      if (checkExistedParams) {
        let item = await Model.findOne({
          where: checkExistedParams,
        });
        if (item && item.id) {
          throw errMsg;
        }
      }
      let addRes = await Model.create(value);

      if (!addRes) {
        throw new Error(APP.constant.MSG.ADD_FAIL);
      }
      return addRes;
    };
  },
  addMultiple(Model) {
    return async function(values) {
      let addRes = await Model.bulkCreate(values);

      if (addRes.length !== values.length) {
        throw new Error(APP.constant.MSG.ADD_FAIL);
      }
      return addRes;
    };
  },
  upsert(Model) {
    return async function(value) {
      await Model.upsert(value);
    };
  },
  updateById(Model) {
    return async function(id, value, uid, isStrictMode = true) {
      let where = {
        id,
      };
      if (uid) {
        where.user_id = uid;
      }

      let updateRes = await Model.update(value, {
        where,
      });

      if (isStrictMode && !updateRes[0]) {
        throw new Error(APP.constant.MSG.UPDATE_FAIL);
      }
    };
  },
  removeById(Model) {
    // 默认软删除
    return async function(id, uid, force = false) {
      let where = {
        id,
      };
      if (uid) {
        where.user_id = uid;
      }

      let destroyCount = await Model.destroy({
        where,
        force,
      });

      if (!destroyCount) {
        throw new Error(APP.constant.MSG.REMOVE_FAIL);
      }
    };
  },
  incrementById(Model) {
    return async function(id, value, uid) {
      let where = {
        id,
      };
      if (uid) {
        where.user_id = uid;
      }
      return await Model.increment(value, {
        where,
      });
    };
  },
};
