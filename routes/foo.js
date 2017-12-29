var router = require('koa-router')()
var Mock = require('../mockjs')

router.get('/', async(ctx, next) => {
  console.log('wwwwww')
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
})

module.exports = router
