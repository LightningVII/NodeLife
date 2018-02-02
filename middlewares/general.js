import koaBody from 'koa-bodyparser'
// import serve from 'koa-static'
import logger from 'koa-logger'
import session from 'koa-session'
// import { resolve } from 'path'
import cors from 'koa-cors'

// const r = path => resolve(__dirname, path)

const CONFIG = {
  maxAge: 86400000
}

export const addBody = app => {
  app.use(cors())
  app.use(koaBody())
}

export const addLoger = app => {
  app.use(logger())
}

/* export const addServe = app => {
  app.use(serve(r('../../public')))
} */

export const addSession = app => {
  app.keys = ['hi, Ace!']
  app.use(session(CONFIG, app))
}
