'use strict'
var Mock = require('../mockjs');
exports.list = async(ctx, next) => {
    const data = Mock.mock({
        'result|16': [{
            cityName: '@city',
            id: '@ID'
        }]
    })
    ctx.body = JSON.stringify(data, null, 4);
}