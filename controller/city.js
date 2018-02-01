'use strict'
/* eslint no-unused-vars: */
import { controller, get, log } from '../decorator/router'
var Mock = require('../mockjs')

@controller('api/city')
export default class {
  @get('/')
  @log
  async (ctx, next) {
    const data = Mock.mock({
      'result|16': [{
        cityName: '@city',
        id: '@ID'
      }]
    })
    ctx.body = JSON.stringify(data, null, 4)
  }
}
