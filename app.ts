require("reflect-metadata");
import Koa from 'koa';
// const bodyParser = require('koa-bodyparser');
import koaBody from 'koa-body';
const controller = require('./controllers');
import server from 'koa-static';
import * as path from 'path';
import session from 'koa-session-minimal';
import { logger } from './utils/logger';
import { userlogin } from './utils/sessionck';
import { uploadfilepath } from './config';
const staticPath = './static'
var app = new Koa();

app.use(userlogin);
// app.use(bodyParser());
app.use(koaBody({
    multipart: true,
    encoding: 'utf-8',
    formidable: {
        uploadDir: uploadfilepath,
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024,
        onFileBegin: function (name, file) {
            logger.info(`file ${name} uploading ${file}`);
        },
        hash: 'sha1',
        multiples: true,
    },
    onError:function(err, ctx){
        logger.error(err.name, err.name);
        ctx.type = 'json';
        ctx.body = 'upload error, file\'s max size is 10mb';
    }
}))

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

app.use(async (ctx: Koa.Context, next: Function) => {
    var start: number = Date.now();

    await next();
    var time: number = Date.now() - start;
    //这里相当于一个中间件, 判断ctx.myerr是否为null, 如果不为null, 则返回数据为json, 返回内容为myerr,并将myerr设为空,以便之后的判断
    if(ctx.myerr != null){
        ctx.type = 'json';
        ctx.body = {msg:ctx.myerr};
        logger.error(ctx.myerr);
        ctx.myerr = null;
    }
    logger.info(`${ctx.method} ${ctx.url} in ${time}ms from ${ctx.request.ip.split(':').pop()}`)
});

app.use(controller());

app.use(server(path.join(__dirname, staticPath)))

app.listen(3000);
logger.info('current process env: ' + process.env.NODE_ENV || 'proct');
logger.info('the app is listen on localhost 3000...');