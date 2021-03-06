const UserModel = require('../models/user');

module.exports = class User {
  /**
   * 根据ID查找用户
   *
   * @static
   * @param {ObjectId} id
   * @param {String} select
   * @param {Object} option
   * @returns
   */
  static getUserById(id, select, option) {
    return UserModel.findById(id, select, option);
  }

  /**
   * 根据手机号查找用户
   *
   * @static
   * @param {Number} mobile
   * @param {String} select
   * @param {Object} option
   * @returns
   */
  static getUserByMobile(mobile, select, option) {
    return UserModel.findOne({ mobile }, select, option);
  }

  /**
   * 根据昵称查找用户
   *
   * @static
   * @param {String} nickname
   * @param {String} select
   * @param {Object} option
   * @returns
   */
  static getUserByNickname(nickname, select, option) {
    return UserModel.findOne({ nickname }, select, option);
  }

  /**
   * 根据条件查询用户
   *
   * @static
   * @param {Object} query
   * @param {String} select
   * @param {Object} option
   * @returns
   */
  static getUsersByQuery(query, select, option) {
    return UserModel.find(query, select, option);
  }

  /**
   * 根据条件统计用户数量
   *
   * @static
   * @param {Object} query
   */
  static countUserByQuery(query) {
    return UserModel.countDocuments(query);
  }

  /**
   * 创建用户
   *
   * @static
   * @param {Number} mobile
   * @param {String} password
   * @param {String} nickname
   * @param {Object} restProps
   * @returns
   */
  static createUser(mobile, password, nickname, restProps) {
    return UserModel.create({ mobile, password, nickname, ...restProps });
  }

  /**
   * 根据ID更新用户信息
   *
   * @static
   * @param {ObjectId} id
   * @param {Object} update
   * @param {Object} option
   * @returns
   */
  static updateUserById(id, update, option) {
    return UserModel.findByIdAndUpdate(id, update, option);
  }

  /**
   * 根据ID删除用户
   *
   * @static
   * @param {ObjectId} id
   * @returns
   */
  static removeUserById(id) {
    return UserModel.findByIdAndRemove(id);
  }
};
