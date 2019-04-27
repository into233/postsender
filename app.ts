require("reflect-metadata");
import  Koa from 'koa';
const bodyParser = require('koa-bodyparser');
const controller = require('./controllers');
import server from 'koa-static';
import * as path from 'path';
import session from 'koa-session-minimal';
import { logger } from './utils/logger';
import { userlogin } from './utils/sessionck';

const staticPath = './static'
var app = new Koa();

app.use(userlogin);
app.use(bodyParser());

app.use(session({
    key: 'session-id',          // cookie 中存储 session-id 时的键名, 默认为 koa:sess
        cookie: {                   // 与 cookie 相关的配置
            // domain: 'localhost',    // 写 cookie 所在的域名
            // path: '/',              // 写 cookie 所在的路径
            maxAge: 60 * 60 * 24 * 24 * 1000,      // cookie 有效时长 24天 sd number 
            httpOnly: false,         // 是否只用于 http 请求中获取
            overwrite: false,        // 是否允许重写
        },
}));

app.use(async (ctx:Koa.Context, next:Function) => {
    var start :number= Date.now();
    // if(!(ctx.url == '/' || ctx.url == '/login' || ctx.url == '/favicon.ico') && ctx.cookies.get('userid') == null){
    //     ctx.body = 'please login in';
    //     var time :number= Date.now() - start;
    //     console.log(`${ctx.method} ${ctx.url} in ${time}ms from ${ctx.request.ip.split(':').pop()} was banned`)
    //     return;
    // }
    await next();
    var time :number= Date.now() - start;
    logger.info(`${ctx.method} ${ctx.url} in ${time}ms from ${ctx.request.ip.split(':').pop()}}`)
});

app.use(controller());

app.use(server(path.join(__dirname, staticPath)))

app.listen(3000);
logger.info('current process env: ' + process.env.NODE_ENV||'proct');
logger.info('the app is listen on localhost 3000...');