const bcrypt = require('bcryptjs');
const UserModel = require('../models/user');
const TopicModel = require('../models/topic');
const ReplyModel = require('../models/reply');
const NoticeModel = require('../models/notice');
const BehaviorModel = require('../models/behavior');

exports.createUser = function(nickname, mobile, other) {
  return UserModel.create({
    nickname,
    mobile,
    password: bcrypt.hashSync('a123456', bcrypt.genSaltSync(10)),
    ...other
  });
};

exports.deleteUser = function(mobile) {
  return UserModel.findOneAndRemove({
    mobile
  });
};

exports.createTopic = function(author_id) {
  return TopicModel.create({
    tab: 'ask',
    title: '测试问题标题',
    content: '# 嘻嘻哈哈哈的内容',
    author_id
  });
};

exports.deleteTopic = function(author_id) {
  return TopicModel.remove({
    author_id
  });
};

exports.createReply = function(author_id, topic_id) {
  return ReplyModel.create({
    author_id,
    topic_id,
    content: '# 这是一段测试回复'
  });
};

exports.deleteReply = function(topic_id) {
  return ReplyModel.remove({
    topic_id
  });
};

exports.createNotice = function(type, target_id, other) {
  return NoticeModel.create({
    type,
    target_id,
    ...other
  });
};

exports.deleteNotice = function(target_id) {
  return NoticeModel.remove({
    target_id
  });
};

exports.createBehavior = function(action, author_id, target_id) {
  return BehaviorModel.create({
    action,
    author_id,
    target_id
  });
};

exports.deleteBehavior = function(author_id) {
  return BehaviorModel.remove({
    author_id
  });
};
