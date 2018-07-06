const formidable = require('formidable');
const BaseComponent = require('../prototype/BaseComponent');
const TopicModel = require('../models/topic');
const UserModel = require('../models/user');
const ReplyModel = require('../models/reply');
const BehaviorModel = require('../models/behavior');
const md2html = require('../utils/md2html');
const logger = require('../utils/logger');

class Topic extends BaseComponent {
  constructor() {
    super();
    this.createTopic = this.createTopic.bind(this);
    this.likeOrUnlikeTopic = this.likeOrUnlikeTopic.bind(this);
    this.collectOrUncollectTopic = this.collectOrUncollectTopic.bind(this);
  }

  // 创建话题
  createTopic(req, res) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (error, fields) => {
      if (error) {
        logger.error(error.message);
        return res.send({
          status: 0,
          type: 'ERROR_PARMAS',
          message: '参数解析失败'
        });
      }

      const { id } = req.session.userInfo;
      const { tab, title, content } = fields;

      try {
        if (!tab) {
          throw new Error('话题所属标签不能为空');
        } else if (!title) {
          throw new Error('话题标题不能为空');
        } else if (!content) {
          throw new Error('话题内容不能为空');
        }
      } catch(err) {
        return res.send({
          status: 0,
          type: 'ERROR_PARAMS_OF_CREATE_TOPIC',
          message: err.message
        });
      }

      const _topic = {
        ...fields,
        content: md2html(content),
        author_id: id,
      };

      try {
        const topic = await TopicModel.create(_topic);
        // 记录用户创建行为
        await this.createBehavior('create', id, topic.id);
        // 用户创建话题积3分
        const currentUser = await UserModel.findById(id);
        currentUser.score += 3;
        await currentUser.save();

        return res.send({
          status: 1
        });
      } catch(err) {
        logger.error(err.message);
        return res.send({
          status: 0,
          type: 'ERROR_SERVICE',
          message: '服务器无响应，请稍后重试'
        });
      }
    });
  }

  // 删除话题
  async deleteTopic(req, res) {
    const { tid } = req.params;
    const { id } = req.session.userInfo;

    try {
      const currentTopic = await TopicModel.findById(tid);

      if (!currentTopic) {
        return res.send({
          status: 0,
          type: 'ERROR_ID_IS_INVALID',
          message: '无效的ID'
        });
      }

      if (!currentTopic.author_id.equals(id)) {
        return res.send({
          status: 0,
          type: 'ERROR_IS_NOT_AUTHOR',
          message: '不能删除别人的话题'
        });
      }

      await TopicModel.findByIdAndUpdate(tid, { delete: true });
      return res.send({
        status: 1
      });
    } catch(err) {
      logger.error(err.message);
      return res.send({
        status: 0,
        type: 'ERROR_SERVICE',
        message: '服务器无响应，请稍后重试'
      });
    }
  }

  // 编辑话题
  editTopic(req, res) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (error, fields) => {
      if (error) {
        logger.error(error);
        return res.send({
          status: 0,
          type: 'ERROR_PARMAS',
          message: '参数解析失败'
        });
      }

      const { tid } = req.params;
      const { id } = req.session.userInfo;

      try {
        const currentTopic = await TopicModel.findById(tid);

        if (!currentTopic) {
          return res.send({
            status: 0,
            type: 'ERROR_ID_IS_INVALID',
            message: '无效的ID'
          });
        }

        if (id !== currentTopic.author_id.toString()) {
          return res.send({
            status: 0,
            type: 'ERROR_IS_NOT_AUTHOR',
            message: '不能编辑别人的话题'
          });
        }

        const { tab, title, content } = fields;

        const topicInfo = {
          tab: tab || currentTopic.tab,
          title: title || currentTopic.title,
          content: md2html(content) || currentTopic.content
        };

        await TopicModel.findByIdAndUpdate(tid, topicInfo);

        return res.send({
          status: 1
        });
      } catch(err) {
        logger.error(err);
        return res.send({
          status: 0,
          type: 'ERROR_SERVICE',
          message: '服务器无响应，请稍后重试'
        });
      }
    });
  }

  // 获取列表
  async getTopicList(req, res) {
    const tab = req.query.tab || 'all';
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;

    let query = {
      is_lock: false,
      delete: false
    };

    if (!tab || tab === 'all') {
      query = {};
    } else if (tab === 'good') {
      query.good = true;
    } else {
      query.tab = tab;
    }

    const options = {
      skip: (page - 1) * size,
      limit: size,
      sort: '-top -last_reply_at'
    };

    try {
      const topicCount = await TopicModel.count(query);
      const topicList = await TopicModel.find(query, '-is_lock -delete', options);

      const promiseAuthor = await Promise.all(topicList.map(item => {
        return new Promise(resolve => {
          resolve(UserModel.findById(item.author_id, 'id nickname avatar'));
        });
      }));

      const promiseLastReply = await Promise.all(topicList.map(item => {
        return new Promise(resolve => {
          resolve(UserModel.findById(item.last_reply, 'id nickname avatar'));
        });
      }));

      const result = topicList.map((item, i) => {
        return {
          ...item.toObject({ virtuals: true }),
          author: promiseAuthor[i],
          last_reply_author: promiseLastReply[i],
          last_reply_at_ago: item.last_reply_at_ago()
        };
      });

      return res.send({
        status: 1,
        data: {
          topics: result,
          currentPage: page,
          total: topicCount,
          totalPage: Math.ceil(topicCount / size),
          tab,
          size
        },
      });
    } catch(err) {
      logger.error(err);
      return res.send({
        status: 0,
        type: 'ERROR_SERVICE',
        message: '服务器无响应，请稍后重试'
      });
    }
  }

  // 搜索话题
  async searchTopic(req, res) {
    const title = req.query.title || '';
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;

    const query = {
      title: { $regex: title },
      is_lock: false,
      delete: false
    };

    const options = {
      skip: (page - 1) * size,
      limit: size,
      sort: '-top -last_reply_at'
    };

    try {
      const topicCount = await TopicModel.count(query);
      const topicList = await TopicModel.find(query, '-is_lock -delete', options);

      const promises = await Promise.all(topicList.map(item => {
        return new Promise(resolve => {
          resolve(UserModel.findById(item.author_id, 'nickname avatar'));
        });
      }));

      const result = topicList.map((item, i) => {
        return { ...item.toObject({ virtuals: true }), author: promises[i] };
      });

      return res.send({
        status: 1,
        data: {
          topics: result,
          currentPage: page,
          total: topicCount,
          totalPage: Math.ceil(topicCount / size),
          size
        },
      });
    } catch(err) {
      logger.error(err);
      return res.send({
        status: 0,
        type: 'ERROR_SERVICE',
        message: '服务器无响应，请稍后重试'
      });
    }
  }

  // 获取无人回复话题
  async getNoReplyTopic(req, res) {
    const query = {
      is_lock: false,
      delete: false,
      reply_count: 0
    };

    const options = {
      limit: 10,
      sort: '-top -last_reply_at'
    };

    try {
      const topicList = await TopicModel.find(query, 'id title', options);

      return res.send({
        status: 1,
        data: topicList
      });
    } catch(err) {
      logger.error(err);
      return res.send({
        status: 0,
        type: 'ERROR_SERVICE',
        message: '服务器无响应，请稍后重试'
      });
    }
  }

  // 获取话题详情
  async getTopicById(req, res) {
    const { tid } = req.params;
    const { userInfo } = req.session;

    try {
      let currentTopic = await TopicModel.findById(tid);

      if (!currentTopic) {
        return res.send({
          status: 0,
          type: 'ERROR_ID_IS_INVALID',
          message: '无效的ID'
        });
      }

      currentTopic.visit_count += 1;
      currentTopic = await currentTopic.save();

      const author = await UserModel.findById(currentTopic.author_id, 'id nickname avatar score');
      const replyList = await ReplyModel.find({ topic_id: currentTopic.id });

      const promises = await Promise.all(replyList.map(item => (
        new Promise(resolve => {
          resolve(UserModel.findById(item.author_id, 'nickname avatar'));
        })
      )));

      let likeBehavior;
      let collectBehavior;

      if (userInfo && userInfo.id) {
        likeBehavior = await BehaviorModel.findOne({ type: 'like', author_id: userInfo.id, target_id: currentTopic.id });
        collectBehavior = await BehaviorModel.findOne({ type: 'collect', author_id: userInfo.id, target_id: currentTopic.id });
      }

      const isLike = (likeBehavior && !likeBehavior.delete) || false;
      const isCollect = (collectBehavior && !collectBehavior.delete) || false;

      const replies = replyList.map((item, i) => {
        return { ...item.toObject({ virtuals: true }), author: promises[i] };
      });

      return res.send({
        status: 1,
        data: { ...currentTopic.toObject({ virtuals: true }), author, replies, isLike, isCollect }
      });
    } catch(err) {
      logger.error(err);
      return res.send({
        status: 0,
        type: 'ERROR_SERVICE',
        message: '服务器无响应，请稍后重试'
      });
    }
  }

  // 喜欢或者取消喜欢话题
  async likeOrUnlikeTopic(req, res) {
    const { tid } = req.params;
    const { id } = req.session.userInfo;

    try {
      const currentTopic = await TopicModel.findById(tid);
      const currentUser = await UserModel.findById(id);

      if (!currentTopic) {
        return res.send({
          status: 0,
          type: 'ERROR_ID_IS_INVALID',
          message: '无效的ID'
        });
      }

      let behavior;

      behavior = await BehaviorModel.findOne({ type: 'like', author_id: id, target_id: tid });

      if (behavior) {
        behavior.delete = !behavior.delete;
        behavior = await behavior.save();
      } else {
        behavior = await this.createBehavior('like', id, tid);
      }

      const tagetUser = await UserModel.findById(currentTopic.author_id);

      if (behavior.delete) {
        currentTopic.like_count -= 1;
        await currentTopic.save();
        currentUser.like_count -= 1;
        await currentUser.save();
        tagetUser.score -= 5;
        await tagetUser.save();
        req.session.userInfo.like_count -= 1;
      } else {
        currentTopic.like_count += 1;
        currentTopic.save();
        currentUser.like_count += 1;
        currentUser.save();
        tagetUser.score += 5;
        await tagetUser.save();
        req.session.userInfo.like_count += 1;
        // 发送提醒 notice
        await this.sendLikeNotice(id, currentTopic.author_id, currentTopic.id);
      }

      return res.send({
        status: 1,
        type: behavior.delete ? 'un_like' : 'like'
      });
    } catch(err) {
      logger.error(err);
      return res.send({
        status: 0,
        type: 'ERROR_SERVICE',
        message: '服务器无响应，请稍后重试'
      });
    }
  }

  // 收藏或者取消收藏话题
  async collectOrUncollectTopic(req, res) {
    const { tid } = req.params;
    const { id } = req.session.userInfo;

    try {
      const currentTopic = await TopicModel.findById(tid);
      const currentUser = await UserModel.findById(id);

      if (!currentTopic) {
        return res.send({
          status: 0,
          type: 'ERROR_ID_IS_INVALID',
          message: '无效的ID'
        });
      }

      let behavior;

      behavior = await BehaviorModel.findOne({ type: 'collect', author_id: id, target_id: tid });

      if (behavior) {
        behavior.delete = !behavior.delete;
        behavior.save();
      } else {
        behavior = await this.createBehavior('collect', id, tid);
      }

      if (behavior.delete) {
        currentTopic.collect_count -= 1;
        currentTopic.save();
        currentUser.collect_count -= 1;
        currentUser.save();
        req.session.userInfo.collect_count -= 1;
      } else {
        currentTopic.collect_count += 1;
        currentTopic.save();
        currentUser.collect_count += 1;
        currentUser.save();
        req.session.userInfo.collect_count += 1;
        // 发送提醒 notice
        await this.sendCollectNotice(id, currentTopic.author_id, currentTopic.id);
      }

      return res.send({
        status: 1,
        type: behavior.delete ? 'un_collect' : 'collect'
      });
    } catch(err) {
      logger.error(err);
      return res.send({
        status: 0,
        type: 'ERROR_SERVICE',
        message: '服务器无响应，请稍后重试'
      });
    }
  }
}

module.exports = new Topic();
