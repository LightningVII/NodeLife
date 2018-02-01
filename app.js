import Koa from 'koa'
import fs from 'fs'
import { resolve } from 'path'
import R from 'ramda'

const app = new Koa()
const MIDDLEWARE = ['general', 'router']
const r = path => resolve(__dirname, path)
const models = r('./models')

fs
  .readdirSync(models)
  .filter(file => ~file.search(new RegExp(/^[^.].*\.js$/)))
  .forEach(file => require(resolve(models, file)))

const useMiddles = app => {
  return R.map(
    R.compose(R.map(i => i(app)), require, i => `${r('./middlewares')}/${i}`)
  )
}

export const loadMiddlewares = async app => {
  await Promise.all(useMiddles(app)(MIDDLEWARE))
}

export default app
