var Mock = require('../mockjs');
var router = require('koa-router')({
    prefix: '/api'
});

const detail = require('./detail');
const foo = require('./foo');
const ad = require('./ad');
const order = require('./order');
const home = require('./home');
const city = require('./city');

router.use('/detail', detail.routes(), detail.allowedMethods());
router.use('/foo', foo.routes(), foo.allowedMethods());
router.use('/ad', ad.routes(), ad.allowedMethods());
router.use('/order', order.routes(), order.allowedMethods());
router.use('/home', home.routes(), home.allowedMethods());
router.use('/city', city.routes(), city.allowedMethods());

module.exports = router;