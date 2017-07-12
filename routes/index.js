var router = require('koa-router')();
var Mock = require('../mockjs');

router.get('/api/detail/:category/:title', async(ctx, next) => {
    var data = Object.create(null)
    console.log("----------params:" + JSON.stringify(ctx.params))
    console.log("----------state:" + JSON.stringify(ctx.state))
    console.log("----------query:" + JSON.stringify(ctx.query))
    data = Mock.mock({
        'result': {
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
            'state': '@constellations',
            date: '@datetime'
        }
    })
    ctx.body = JSON.stringify(data, null, 4);
})

router.get('/api/:key', async(ctx, next) => {
    var data = Object.create(null)
    console.log("----------params:" + JSON.stringify(ctx.params))
    console.log("----------state:" + JSON.stringify(ctx.state))
    console.log("----------query:" + JSON.stringify(ctx.query))
    switch (ctx.params.key) {
        case 'ad':
            data = Mock.mock({
                'result|3': [{
                    'items|10': [{
                        link: '/search/' + '@LINK',
                        icon: 'icon-brand' + '@INT(2,100)',
                        text: '@TEXT',
                    }]
                }]
            })
            break;
        case 'homeList':
            let resultSize = 'result|3'
            if (ctx.query.keyword) {
                resultSize = 'result|4'
            } else if (ctx.query.category) {
                resultSize = 'result|10'
            }

            data = Mock.mock({
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
            break;
        case 'cityList':
            data = Mock.mock({
                'result|16': [{
                    cityName: '@city',
                    id: '@ID'
                }]
            })
            break;
    }

    ctx.body = JSON.stringify(data, null, 4);
})

router.get('/foo', async(ctx, next) => {
    var data = Mock.mock({
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

module.exports = router;