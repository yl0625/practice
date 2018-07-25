const mongoose = require('mongoose');
const logger = require('./utils/logger');
const config = require('../config.default');

// connect mongodb
const dbpath = process.env.NODE_ENV === 'test' ? 'mongodb://localhost/practice-test' : config.mongodb;
mongoose.connect(dbpath);
const db = mongoose.connection;

db.on('error', err => {
  if (err) {
    logger.error(`MongoDB Connection Error: ${err}`);
    process.exit(1);
  } else {
    logger.info('MongoDB Connection Success!');
  }
});
