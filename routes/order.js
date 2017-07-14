var router = require('koa-router')();
var order = require('../controller/order');
router.get('/list', order.list)

module.exports = router;