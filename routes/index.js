var router = require('koa-router')();
var Mock = require('mockjs');
// import Mock from 'mockjs'
Mock.Random.extend({
    constellation: function(data) {
        var constellations = ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座']
        return this.pick(constellations)
    },
    link: function(data) {
        var links = ['jingdian', 'ktv', 'ijingdian', 'ojingdian', 'u']
        return this.pick(links)
    },
    text: function(data) {
        var keys = ['景点', 'ktv', '商场']
        return this.pick(keys)
    },
    colors: function(data) {
        return Mock.Random.image('200x100', Mock.Random.color(), Mock.Random.cword(5))
    }
})

router.get('/', async(ctx, next) => {
    ctx.state = {
        title: 'koa2 title'
    };

    ctx.body = JSON.stringify({
        title: 'koa2 title'
    });

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
        case 'detail':
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