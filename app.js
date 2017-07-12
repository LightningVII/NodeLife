const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser')();
const logger = require('koa-logger');
const static = require('koa-static');
const Promise = require("bluebird")
const request = Promise.promisify(require('request'))

// const proxy = require('koa-proxy2');
// const proxy = require('koa-proxies');
// const httpsProxyAgent = require('https-proxy-agent')

const path = require('path');

const staticPath = 'public'

// app.use(proxy('/ws-truck-app/app', {
//     target: 'http://10.134.240.92:8088/f-driver/ws-truck-app/app',
//     changeOrigin: true,
//     agent: new httpsProxyAgent('http://1.2.3.4:88'),
//     rewrite: path => path.replace(/^\/octocat(\/|\/\w+)?$/, '/vagusx'),
//     logs: true
// }))

const index = require('./routes/index');


app.proxy = false;
// app.use(static(path.join(__dirname, staticPath))); error handler
onerror(app);

// middlewares
app.use(bodyparser);
app.use(json());
app.use(logger());

// app.use(views(__dirname + '/views', {extension: 'jade'})); logger
app.use(async(ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// app.use(detail.routes(), detail.allowedMethods());
app.use(index.routes(), index.allowedMethods());

module.exports = app;