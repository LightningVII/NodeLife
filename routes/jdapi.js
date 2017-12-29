const router = require('koa-router')()
const jdapi = require('../controller/jdapi')
router.get('/driver', jdapi.driver)
router.get('/news', jdapi.news)
router.get('/channel', jdapi.channel)

module.exports = router
