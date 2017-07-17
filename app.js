const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const db = 'mongodb://localhost/imooc-app'

mongoose.Promise = global.Promise;
// mongoose.Promise = require('bluebird')
mongoose.connect(db, {
    useMongoClient: true,
});

const models_path = path.join(__dirname, '/models')
const walk = modelPath => {
    fs.readdirSync(modelPath).map(file => {
        const filePath = path.join(modelPath, '/' + file)
        const stat = fs.statSync(filePath)

        if (stat.isFile) {
            if (/(.*)\.(js|coffee)/.test(file)) {
                require(filePath)
            }
        } else {
            walk(filePath)
        }
    })
}

walk(models_path)


const Koa = require('koa');
const logger = require('koa-logger');
const session = require('koa-session');
const bodyParser = require('koa-bodyparser');
const app = new Koa();

const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const static = require('koa-static');
const Promise = require("bluebird")
const request = Promise.promisify(require('request'))


app.use(logger());
app.use(session(app));
app.use(bodyParser());
app.use(json());

const staticPath = 'public'

const index = require('./routes/index');
app.proxy = false;
// app.use(static(path.join(__dirname, staticPath))); error handler
onerror(app);

app.use(async(ctx, next) => {
    const start = new Date();
    const ms = new Date() - start;
    console.log("----------params:" + JSON.stringify(ctx.params))
    console.log("----------query:" + JSON.stringify(ctx.query))
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
    ctx.body = {
        success: true
    }
    await next();
});

// app.use(detail.routes(), detail.allowedMethods());
app.use(index.routes(), index.allowedMethods());

module.exports = app;