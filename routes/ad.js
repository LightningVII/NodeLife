var router = require('koa-router')()
var Mock = require('../mockjs')

router.get('/', async(ctx, next) => {
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
})

module.exports = router
