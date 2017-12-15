const router = require('koa-router')();
const comment = require('../controller/comment');
const app = require('../controller/app');

router.get('/', /*App.hasToken,*/ comment.find);
router.post('/', app.hasBody, app.hasToken, comment.save);

module.exports = router;
