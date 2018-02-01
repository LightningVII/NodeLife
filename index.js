import app, { loadMiddlewares } from './app'
import { connectDB, initAdmin } from './database/init'
const index = require('./routes/index')
console.log(initAdmin)
;(async () => {
  try {
    await connectDB()
    await loadMiddlewares(app)

    app.use(async(ctx, next) => {
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
    // await initAdmin()
  } catch (err) {
    console.log(err)
  }
  // 进行交互
  // ...

  // 关闭浏览器
  // await browser.close();

  // require('./tasks/movie-to-db');
  // require('./tasks/api-to-db');
  // require('./tasks/trailer-to-db');
  // require('./tasks/qiniu-to-db');
})()
export default app
