var router = require('koa-router')();
var city = require('../controller/city');
router.get('/', city.list)

module.exports = router;