const Koa = require('koa');
const bodyParser  = require('koa-bodyparser');
const Router = require('koa-router');

var app = new Koa();
var router = new Router();

app.use(bodyParser());

app.use(async (ctx, next)=>{
    let start = new Date();
    await next();
    let time = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} in ${time}ms from ${ctx.request.ip.split(':').pop()}`)
});

router.get(['/index', '/', 'index.html'], async (ctx, next)=>{
    ctx.response.body = 'this is index page';
    await next();
});

app.use(router.routes());

app.listen(3000);
console.log('the app is listen on localhost 3000...');
