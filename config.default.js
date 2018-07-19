/*
* 配置
*/
const path = require('path');

const config = {
  // Server
  server_port: 3000,
  db: 'mongodb://localhost/practice',
  log_dir: path.join(__dirname, './server/logs'),
  session_secret: 'practice_secret',

  // Site
  name: 'Mints - 薄荷糖社区',
  description: '简洁、快乐的交流社区',
  keywords: 'mints, community',
  author: '青湛(github/mintsweet)',
  site_icon: '/static/img/favicon.ico',
  
  site_port: 3001,

  tabs: [
    { name: '分享', url: 'share' },
    { name: '问答', url: 'ask' },
    { name: '招聘', url: 'offer' }
  ]
};

module.exports = config;
