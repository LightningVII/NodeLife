const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const db = 'mongodb://localhost/my-imooc'

mongoose.Promise = global.Promise
mongoose.Promise = require('bluebird')
mongoose.connect(db, {
  useMongoClient: true
})

const modelsPath = path.join(__dirname, '/models')
const walk = modelPath => {
  fs.readdirSync(modelPath).map(file => {
    const filePath = path.join(modelPath, '/' + file)
    const stat = fs.statSync(filePath)

    if (stat.isFile) {
      if (/(.*)\.(js|coffee)/.test(file)) {
        require(filePath)
      }
    } else {
      walk(filePath)
    }
  })
}

walk(modelsPath)

const Koa = require('koa')
const logger = require('koa-logger')
const session = require('koa-session')
const bodyParser = require('koa-bodyparser')
const app = new Koa()

const json = require('koa-json')
const onerror = require('koa-onerror')

app.keys = ['secret', 'key']

app.use(logger())
app.use(session(app))
app.use(bodyParser())
app.use(json())

const index = require('./routes/index')
app.proxy = false
onerror(app)

app.use(async (ctx, next) => {
  const start = new Date()
  const ms = new Date() - start
  const body = ctx.request && ctx.request.body
  console.log('----------body:' + JSON.stringify(body))
  console.log('----------params:' + (ctx.params ? JSON.stringify(ctx.params) : ''))
  console.log('----------query:' + (Object.getOwnPropertyNames(ctx.query).length ? JSON.stringify(ctx.query) : ''))
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
  ctx.body = {
    success: false
  }
  await next()
})

app.use(index.routes(), index.allowedMethods())

module.exports = app
