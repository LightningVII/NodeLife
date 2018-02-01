'use strict'
/* eslint no-unused-vars: */
import { controller, get, log } from '../decorator/router'
var Mock = require('../mockjs')

@controller('api/foo')
export default class {
  @get('')
  @log
  async (ctx, next) {
    const data = Mock.mock({
      'result|9': [{
        id: '@increment',
        cname: '@cfirst@clast',
        title: '@ctitle',
        sentence: '@csentence',
        paragraph: '@cparagraph',
        url: '@url',
        email: '@email',
        city: '@city',
        img: '@COLORS',
        'age|1-100': 100,
        'state': '@constellations',
        date: '@datetime'
      }]
    })
    ctx.body = JSON.stringify(data)
  }
}
