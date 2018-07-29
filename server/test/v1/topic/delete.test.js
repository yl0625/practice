const app = require('../../../app').listen();
const request = require('supertest')(app);
const should = require('should');
const support = require('../../support');
const tempId = require('mongoose').Types.ObjectId();

describe('test /v1/topic/:tid/delete', function() {
  let mockUser;
  let mockUser2;
  let mockTopic;

  before(async function() {
    mockUser = await support.createUser(18800000000, '话题创建者');
    mockUser2 = await support.createUser(18800000001, '话题无关者');
    mockTopic = await support.createTopic(mockUser.id);
  });

  after(async function() {
    await support.deleteAction(mockUser.id);
    await support.deleteTopic(mockUser.id);
    await support.deleteUser(mockUser.mobile);
    await support.deleteUser(mockUser2.mobile);
    mockTopic = null;
    mockUser = null;
    mockUser2 = null;
  });

  it('should / status 401 when the not signin', async function() {
    try {
      const res = await request.delete(`/v1/topic/${mockTopic.id}/delete`);

      res.status.should.equal(401);
      res.error.text.should.equal('需要用户登录权限');
    } catch(err) {
      should.ifError(err.message);
    }
  });

  it('should / status 410 when the topic does not exist', async function() {
    try {
      let res;

      res = await request.post('/v1/signin').send({
        mobile: mockUser.mobile,
        password: 'a123456'
      });

      res.status.should.equal(200);

      res = await request.delete(`/v1/topic/${tempId}/delete`).set('Authorization', res.text);

      res.status.should.equal(410);
      res.error.text.should.equal('话题不存在');
    } catch(err) {
      should.ifError(err.message);
    }
  });

  it('should / status 403 when the topic not yours', async function() {
    try {
      let res;

      res = await request.post('/v1/signin').send({
        mobile: mockUser2.mobile,
        password: 'a123456'
      });

      res.status.should.equal(200);

      res = await request.delete(`/v1/topic/${mockTopic.id}/delete`).set('Authorization', res.text);

      res.status.should.equal(403);
      res.error.text.should.equal('不能删除别人的话题');
    } catch(err) {
      should.ifError(err.message);
    }
  });

  it('should / status 200', async function() {
    try {
      let res;

      res = await request.post('/v1/signin').send({
        mobile: mockUser.mobile,
        password: 'a123456'
      });

      res.status.should.equal(200);

      res = await request.delete(`/v1/topic/${mockTopic.id}/delete`).set('Authorization', res.text);

      res.status.should.equal(200);
    } catch(err) {
      should.ifError(err.message);
    }
  });
});
