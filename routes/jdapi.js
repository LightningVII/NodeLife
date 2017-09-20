var router = require('koa-router')();
var jdapi = require('../controller/jdapi');
router.get('/driver', jdapi.driver);
router.get('/news', jdapi.news);
router.get('/channel', jdapi.channel);

module.exports = router;