var router = require('koa-router')({
    prefix: '/api'
});
var Mock = require('../mockjs');
const detail = require('./detail');

router.use('/detail', detail.routes(), detail.allowedMethods());

router.get('/foo', async(ctx, next) => {
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
    ctx.body = JSON.stringify(data, null, 4);
});

router.get('/ad', async(ctx, next) => {
    const data = Mock.mock({
        'result|3': [{
            'items|10': [{
                link: '/search/' + '@LINK',
                icon: 'icon-brand' + '@INT(2,100)',
                text: '@TEXT',
            }]
        }]
    })
    ctx.body = JSON.stringify(data, null, 4);
});

router.get('/orderList', async(ctx, next) => {
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
    ctx.body = JSON.stringify(data, null, 4);
});

router.get('/homeList', async(ctx, next) => {
    let resultSize = 'result|3'
    if (ctx.query.keyword) {
        resultSize = 'result|4'
    } else if (ctx.query.category) {
        resultSize = 'result|10'
    }

    const data = Mock.mock({
        [resultSize]: [{
            title: '@ctitle',
            distance: '@csentence',
            text: '@city',
            price: '@INT(40,100)',
            img: '@COLORS',
            id: '@ID'
        }],
        hasMore: ctx.query.category ? (ctx.query.keyword ? true : false) : (ctx.query.page !== "5" ? true : false),
        city: ctx.query.cityName
    })
    ctx.body = JSON.stringify(data, null, 4);
});

router.get('/cityList', async(ctx, next) => {
    const data = Mock.mock({
        'result|16': [{
            cityName: '@city',
            id: '@ID'
        }]
    })
    ctx.body = JSON.stringify(data, null, 4);
});

router.get('/:key', async(ctx, next) => {
    var data = Object.create(null)
    console.log("----++++-----params:" + JSON.stringify(ctx.params))
    console.log("----------state:" + JSON.stringify(ctx.state))
    console.log("----------query:" + JSON.stringify(ctx.query))
    ctx.body = JSON.stringify(data, null, 4);
})

module.exports = router;