'use strict'
/* eslint no-unused-vars: */
import { controller, get, log } from '../decorator/router'
var Mock = require('../mockjs')

@controller('api/city')
export default class {
  @get('')
  @log
  async list (ctx, next) {
    const data = Mock.mock({
      'result|3': [{
        cityName: '@city',
        id: '@ID'
      }]
    })
    ctx.body = JSON.stringify(data, null, 4)
  }

  @get('/:id')
  @log
  async detail (ctx, next) {
    console.log(ctx.params.id)
    const data = Mock.mock({
      'result': {
        id: ctx.params.id,
        cityName: '@city'
      }
    })
    ctx.body = JSON.stringify(data, null, 4)
  }
}
