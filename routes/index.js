'use strict';
const Promise = require("bluebird")
const request = Promise.promisify(require('request'))
const router = require('koa-router')({
    prefix: '/api'
});

const app = require('../controller/app');
router.post('/signature', app.hasBody, app.hasToken, app.signature);

const detail = require('./detail');
router.use('/detail', detail.routes(), detail.allowedMethods());

const foo = require('./foo');
router.use('/foo', foo.routes(), foo.allowedMethods());

const ad = require('./ad');
router.use('/ad', ad.routes(), ad.allowedMethods());

const order = require('./order');
router.use('/order', order.routes(), order.allowedMethods());

const home = require('./home');
router.use('/home', home.routes(), home.allowedMethods());

const city = require('./city');
router.use('/city', city.routes(), city.allowedMethods());

const user = require('./users');
router.use('/user', user.routes(), user.allowedMethods());

const jdapi = require('./jdapi');
router.use('/jd', jdapi.routes(), user.allowedMethods());

const creations = require('./creations');
router.use('/creations', creations.routes(), creations.allowedMethods());

const comment = require('./comment');
router.use('/comments', comment.routes(), comment.allowedMethods());

/* 豆瓣 api */
router.get('/douban', async(ctx, next) => {
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
