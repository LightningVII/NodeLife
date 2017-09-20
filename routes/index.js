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
const user = require('./users');
const jdapi = require('./jdapi');

router.use('/detail', detail.routes(), detail.allowedMethods());
router.use('/foo', foo.routes(), foo.allowedMethods());
router.use('/ad', ad.routes(), ad.allowedMethods());
router.use('/order', order.routes(), order.allowedMethods());
router.use('/home', home.routes(), home.allowedMethods());
router.use('/city', city.routes(), city.allowedMethods());
router.use('/user', user.routes(), user.allowedMethods());
router.use('/jd', jdapi.routes(), user.allowedMethods());


// app
//   router.post('/signature', App.hasBody, App.hasToken, App.signature)

// creations
//   router.get('/creations', Creation.find)
//   router.post('/creations', App.hasBody, App.hasToken, Creation.save)
//   router.post('/creations/video', App.hasBody, App.hasToken, Creation.video)
//   router.post('/creations/audio', App.hasBody, App.hasToken, Creation.audio)

// comments
//   router.get('/comments', /*App.hasToken,*/ Comment.find)
//   router.post('/comments', App.hasBody, App.hasToken, Comment.save)

// votes
//   router.post('/up', App.hasBody, App.hasToken, Creation.up)


module.exports = router;