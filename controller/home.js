'use strict'
/* eslint no-unused-vars: */
import { controller, get, log, required, authLogin } from '../decorator/router'
var Mock = require('../mockjs')

@controller('api/home')
export default class {
  @get('list')
  @log
  async (ctx, next) {
    let resultSize = 'result|3'
    if (ctx.query.keyword) {
      resultSize = 'result|4'
    } else if (ctx.query.category) {
      resultSize = 'result|10'
    }

    const data = Mock.mock({
      [resultSize]: [
        {
          title: '@ctitle',
          distance: '@csentence',
          text: '@city',
          price: '@INT(40,100)',
          img: '@COLORS',
          id: '@ID'
        }
      ],
      hasMore: ctx.query.category
        ? !!ctx.query.keyword
        : ctx.query.page !== '5',
      city: ctx.query.cityName
    })
    ctx.body = JSON.stringify(data, null, 4)
  }
}
