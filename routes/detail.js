var router = require('koa-router')()
var detail = require('../controller/detail')

router.get('/', detail.info)
router.get('/comment/:type', detail.commentList)

module.exports = router
