'use strict'
var Mock = require('../mockjs');
exports.info = async(ctx, next) => {
    var data = Object.create(null)
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
}

exports.commentList = async(ctx, next) => {
    var data = Object.create(null)
    switch (ctx.params.type) {
        case 'list':
            data = Mock.mock({
                'result|4': [{
                    title: '@ctitle',
                    username: '@cname',
                    'star|1-5': 3,
                    comment: '@cparagraph',
                    text: '@city',
                    price: '@INT(40,100)',
                    img: '@COLORS',
                    id: '@ID'
                }],
                hasMore: ctx.query.page !== "5" ? true : false,
            })
            break;
    }
    ctx.body = JSON.stringify(data, null, 4);
}