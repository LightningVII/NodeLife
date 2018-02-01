import app, { loadMiddlewares } from './app'
import { connectDB, initAdmin } from './database/init'
console.log(initAdmin)
;(async () => {
  try {
    await connectDB()
    await loadMiddlewares(app)
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
