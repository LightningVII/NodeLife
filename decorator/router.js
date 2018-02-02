import { resolve } from 'path'
import Router from 'koa-router'
import glob from 'glob'
import _ from 'lodash'
import R from 'ramda'

let reqID = 0
const decorate = (args, middleware) => {
  let [target, key, descriptor] = args

  target[key] = isArray(target[key])
  target[key].unshift(middleware)

  return descriptor
}
export const symbolPrefix = Symbol('prefix')
export let routersMap = new Map()

export const isArray = c => (_.isArray(c) ? c : [c])

export const normalizePath = path => (path.startsWith('/') ? path : `/${path}`)

export class Route {
  constructor (app, apiPath) {
    this.app = app
    this.router = new Router()
    this.apiPath = apiPath
  }

  init () {
    glob.sync(resolve(this.apiPath, './**/*.js')).forEach(require)

    for (let [conf, controller] of routersMap) {
      const controllers = isArray(controller)
      let prefixPath = conf.target[symbolPrefix]
      if (prefixPath) prefixPath = normalizePath(prefixPath)
      const routerPath = prefixPath + conf.path

      this.router[conf.method](routerPath, ...controllers)
    }

    this.app.use(this.router.routes())
    this.app.use(this.router.allowedMethods())
  }
}

export const router = (conf = {}) => (target, key, descriptor) => {
  console.log(conf)
  conf.path = normalizePath(conf.path)

  routersMap.set(
    {
      target,
      ...conf
    },
    target[key]
  )
}

export const controller = path => target =>
  (target.prototype[symbolPrefix] = path)

export const get = path =>
  router({
    method: 'get',
    path: path
  })

export const post = path =>
  router({
    method: 'post',
    path: path
  })

export const put = path =>
  router({
    method: 'put',
    path: path
  })

export const del = path =>
  router({
    method: 'del',
    path: path
  })

export const use = path =>
  router({
    method: 'use',
    path: path
  })

export const all = path =>
  router({
    method: 'all',
    path: path
  })

export const convert = middleware => (...args) => decorate(args, middleware)

export const log = convert(async (ctx, next) => {
  let currentReqID = reqID++
  console.time(`${currentReqID} ${ctx.method} ${ctx.url}`)
  await next()
  console.timeEnd(`${currentReqID} ${ctx.method} ${ctx.url}`)
})

/*
  @required({
    body: ['username', 'password'],
    query: ['token']
  })
*/
export const required = rules =>
  convert(async (ctx, next) => {
    let errors = []
    const passRules = R.forEachObjIndexed((value, key) => {
      errors = R.filter(i => !R.has(i, ctx.request[key]))(value)
    })
    passRules(rules)

    if (errors.length) ctx.throw(412, `${errors.join(',')} is required`)
    await next()
  })

/*
  @session({
    user: ['accessToken'],
    credentials: true
  })
*/
export const session = rules =>
convert(async (ctx, next) => {
  let errors = []
  const passRules = R.forEachObjIndexed((value, key) => {
    errors = R.filter(i => !R.has(i, ctx.session[key]))(value)
  })
  passRules(rules)

  if (errors.length) ctx.throw(412, `${errors.join(',')} is required`)
  await next()
})
