import app, { loadMiddlewares } from './app';
import { connectDB, initAdmin } from './database/init';
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);
console.log(initAdmin);
(async () => {
    /* try {
        await connectDB();
        await loadMiddlewares(app);
        // await initAdmin()
    } catch (err) {
        console.log(err);
    } */

    /* app.get('/', function(req, res) {
        console.log
        res.sendfile('index.html');
    }); */

    app.use(async(ctx, next) => {
        const start = new Date()
        const ms = new Date() - start
        const body = ctx.request && ctx.request.body
        ctx.body = "hello world" + start
    })

    io.on('connection', function(socket) {
        console.log('a user connected');
    });

    setInterval(() => {
        io.emit('ping', { data: new Date() / 1 });
    }, 100000);

    // http.listen(3000, function() {
    //     console.log('listening on *:3000');
    // });
    // 进行交互
    // ...

    // 关闭浏览器
    // await browser.close();

    // require('./tasks/movie-to-db');
    // require('./tasks/api-to-db');
    // require('./tasks/trailer-to-db');
    // require('./tasks/qiniu-to-db');
})();
export default {app, server};
