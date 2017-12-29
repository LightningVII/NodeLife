'use strict'
var Mock = require('../mockjs')
exports.list = async(ctx, next) => {
  const data = Mock.mock({
    'result|10': [{
      title: '@ctitle',
      distance: '@csentence',
      commentState: /^[02]{1}$/,
      price: '@INT(40,100)',
      img: '@COLORS',
      id: '@ID'
    }]
  })
  ctx.body = JSON.stringify(data, null, 4)
}
