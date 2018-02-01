'use strict'
const router = require('koa-router')({
  prefix: '/api'
})

const app = require('../controller/app')
router.post('/signature', app.hasBody, app.hasToken, app.signature)

const order = require('./order')
router.use('/order', order.routes(), order.allowedMethods())

const user = require('./users')
router.use('/user', user.routes(), user.allowedMethods())

const creations = require('./creations')
router.use('/creations', creations.routes(), creations.allowedMethods())

const comment = require('./comment')
router.use('/comments', comment.routes(), comment.allowedMethods())

module.exports = router
