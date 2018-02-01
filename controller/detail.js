'use strict'
/* eslint no-unused-vars: */
import { controller, get, log } from '../decorator/router'
var Mock = require('../mockjs')

@controller('api/detail')
export default class {
  /**
   * @example http://localhost:3333/api/detail
   */
  @get('')
  @log
  async info (ctx, next) {
    let data
    data = Mock.mock({
      result: {
        id: ctx.query.id,
        cname: '@cfirst@clast',
        title: '@ctitle',
        sentence: '@csentence',
        paragraph: '@cparagraph',
        url: '@url',
        email: '@email',
        city: '@city',
        img: '@COLORS',
        'star|1-5': 3,
        'price|1-100': 100,
        state: '@constellations',
        date: '@datetime'
      }
    })
    ctx.body = JSON.stringify(data, null, 4)
  }

  /**
   * @example http://localhost:3333/api/detail/comment/list
   */
  @get('comment/:type')
  @log
  async commentList (ctx, next) {
    let data
    switch (ctx.params.type) {
      case 'list':
        data = Mock.mock({
          'result|4': [
            {
              title: '@ctitle',
              username: '@cname',
              'star|1-5': 3,
              comment: '@cparagraph',
              text: '@city',
              price: '@INT(40,100)',
              img: '@COLORS',
              id: '@ID'
            }
          ],
          hasMore: ctx.query.page !== '5'
        })
        break
    }
    ctx.body = JSON.stringify(data, null, 4)
  }
}
