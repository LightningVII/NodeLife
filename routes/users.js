const Promise = require("bluebird")
const request = Promise.promisify(require('request'))
var router = require('koa-router')();
var app = require('../controller/app');
var user = require('../controller/user');

router.post('/signup', app.hasBody, user.signup)
router.post('/verify', app.hasBody, user.verify)
router.post('/update', app.hasBody, app.hasToken, user.update)


router.get('/', function(ctx, next) {
    console.log('this is a users response!')
    ctx.body = 'this is a users response!';
});

router.get('/bar', async(ctx, next) => {
    let json = {}
    await request({
        method: 'GET',
        url: 'http://api.douban.com/v2/movie/top250',
        json: true
    }).then(response => {
        json = response.body
    })
    ctx.body = JSON.stringify(json);
});
module.exports = router;