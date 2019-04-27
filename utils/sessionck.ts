import { Context } from "koa";
import { logger } from "./logger";

//判断用户访问的url是否需要登陆的中间件
var whiteurl = ['/', '/index', '/index.html', '/login', '/signon']


var userlogin = async (ctx: Context, next: Function) => {
    if (((ctx.session == undefined) || (ctx.session.username == undefined)) &&
        !(whiteurl.findIndex(function (value) { return value == ctx.url })) &&
        process.env.NODE_ENV == 'product') {
        ctx.redirect('/login');
        return;
    }

    //TODO admin judgements

    await next();
}

export { userlogin }