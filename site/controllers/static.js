const { getQuickStartDoc, getApiDoc, getAboutDoc } = require('../http/api');
const md2html = require('../utils/md2html');

class Static {
  // 快速开始
  async renderQuickStartDoc(req, res) {
    const text = await getQuickStartDoc();
    return res.render('static/index', {
      title: '快速开始',
      text: md2html(text)
    });
  }

  // API说明
  async renderApiDoc(req, res) {
    const text = await getApiDoc();
    return res.render('static/index', {
      title: 'API说明',
      text: md2html(text)
    });
  }

  // 关于
  async renderAboutDoc(req, res) {
    const text = await getAboutDoc();
    return res.render('static/index', {
      title: '关于',
      text: md2html(text)
    });
  }
}

module.exports = new Static();
