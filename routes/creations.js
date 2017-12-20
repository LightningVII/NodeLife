const router = require('koa-router')();
const creations = require('../controller/creations');
const app = require('../controller/app');

router.get('/', creations.find);
router.post('/', app.hasBody, app.hasToken, creations.save);
router.post('/video', app.hasBody, app.hasToken, creations.video);
router.post('/audio', app.hasBody, app.hasToken, creations.audio);

module.exports = router;
