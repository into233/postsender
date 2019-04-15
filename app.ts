require("reflect-metadata");
// const Koa = require('koa');
import  Koa from 'koa';
const bodyParser = require('koa-bodyparser');
const controller = require('./controllers');
const db = require('./db')

var app = new Koa();

app.use(bodyParser());

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
    console.log(`${ctx.method} ${ctx.url} in ${time}ms from ${ctx.request.ip.split(':').pop()}`)
});


app.use(controller());

app.listen(3000);
console.log('the app is listen on localhost 3000...');