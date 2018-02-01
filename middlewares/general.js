import bodyParser from 'koa-bodyparser'
import serve from 'koa-static'
import logger from 'koa-logger'
import { resolve } from 'path'
import cors from 'koa-cors'

const r = path => resolve(__dirname, path)

export const addBody = app => {
  app.use(cors())
  app.use(bodyParser())
}

export const addLoger = app => {
  app.use(logger())
}

export const addServe = app => {
  app.use(serve(r('../../public')))
}
