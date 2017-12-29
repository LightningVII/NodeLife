var router = require('koa-router')()
var home = require('../controller/home')
router.get('/list', home.list)

module.exports = router
