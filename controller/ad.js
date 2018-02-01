'use strict'
/* eslint no-unused-vars: */
import { controller, get, log } from '../decorator/router'
var Mock = require('../mockjs')

@controller('api/ad')
export default class {
  @get('')
  @log
  async (ctx, next) {
    const data = Mock.mock({
      'result|3': [{
        'items|10': [{
          link: '/search/' + '@LINK',
          icon: 'icon-brand' + '@INT(2,100)',
          text: '@TEXT'
        }]
      }]
    })
    ctx.body = JSON.stringify(data, null, 4)
  }
}
