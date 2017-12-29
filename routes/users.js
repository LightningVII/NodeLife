const router = require('koa-router')()
const app = require('../controller/app')
const user = require('../controller/user')

router.post('/signup', app.hasBody, user.signup)
router.post('/verify', app.hasBody, user.verify)
router.post('/update', app.hasBody, app.hasToken, user.update)

module.exports = router
