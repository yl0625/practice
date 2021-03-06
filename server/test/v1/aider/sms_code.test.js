const app = require('../../../app').listen();
const request = require('supertest')(app);
const should = require('should');

describe('test /v1/aider/sms_code', function() {
  it('should / status 400 when the mobile is invalid', async function() {
    try {
      const res = await request.get('/v1/aider/sms_code').expect(400);

      res.text.should.equal('手机号格式不正确');
    } catch(err) {
      should.ifError(err.message);
    }
  });

  it('should / status 200', async function() {
    try {
      const res = await request.get('/v1/aider/sms_code').query({
        mobile: '18800000000',
        expired: 100
      }).expect(200);

      res.text.length.should.equal(6);
    } catch(err) {
      should.ifError(err.message);
    }
  });
});
