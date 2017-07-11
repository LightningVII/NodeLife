const Promise = require("bluebird")
const request = Promise.promisify(require('request'))
var router = require('koa-router')();

// router.prefix('/ws-truck-app/app');

router.get('/', function(ctx, next) {
    console.log('this is a users response!')
    ctx.body = 'this is a users response!';
});

router.get('/bar', async(ctx, next) => {
    var json = {}
        // ctx.status = 200
    await request({
        method: 'GET',
        url: 'http://api.douban.com/v2/movie/top250',
        // url: 'http://v5.pc.duomi.com/search-ajaxsearch-searchall?kw=小提琴&pi=1&pz=20',
        json: true
    }).then(response => {
        json = response.body
    })

    // ctx.response = JSON.stringify(json)
    // ctx.response = json
    ctx.body = JSON.stringify(json);
});

module.exports = router;