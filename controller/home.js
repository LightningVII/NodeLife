'use strict'
var Mock = require('../mockjs');
exports.list = async(ctx, next) => {
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
}