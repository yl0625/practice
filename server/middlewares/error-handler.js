const logger = require('../utils/logger');

/* eslint-disable no-unused-vars */
module.exports = (err, req, res, next) => {
  logger.error(err.message);
  return res.send({
    status: 0,
    type: 'ERROR_SERVICE',
    message: err.message
  });
};