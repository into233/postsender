import { Context } from "koa";
import { pushArticals } from "../module/service/ArticalServiece";
import { createReadStream } from "fs";
import Artical from "../module/Artical";
import { logger } from "../utils/logger";

/**
 * 返回推送文章的service
 * 数据库事先存有一直到八月的数据, 拿到date<now的数据
 * 
 * @param ctx 
 * @param next 
 */

var ajaxtest = async (ctx: Context, next: Function) => {
    ctx.response.type = 'html';
    ctx.response.body = createReadStream('./static/html/ajaxtest.htm');
}

var SpushArticles = async (ctx: Context, next: Function) => {
    var size = ctx.request.body.size;
    var page = ctx.request.body.page;
    logger.debug(ctx.session);

    ctx.session.username = { uname: 'uaname' };
    // ctx.cookies.set('username', 'uaname', {
    //     httpOnly: false,
    // });

    var articles: Artical[];

    await pushArticals(page, size).then((result) => {
        ctx.type = 'json';
        ctx.body = result;
        logger.info('debuginfo ' + result);
    }).catch((err) => {
        logger.error('pushArticles error:', err);
        ctx.type = 'json';
        ctx.body = { msg: "some inputs is not a number or can not convert to a number" };
    });
    await next();
}

export = {
    'POST /getArticals': SpushArticles,
    'GET /ajaxtest': ajaxtest,
}