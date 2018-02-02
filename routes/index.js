'use strict'
const router = require('koa-router')({
  prefix: '/api'
})

const app = require('../controller/app')
router.post('/signature', app.hasBody, app.hasToken, app.signature)

const creations = require('./creations')
router.use('/creations', creations.routes(), creations.allowedMethods())

const comment = require('./comment')
router.use('/comments', comment.routes(), comment.allowedMethods())

module.exports = router
