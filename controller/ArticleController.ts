import { Context } from "koa";
import { pushArticals, deleteArtical, getArticalfromCollect } from "../module/service/ArticalService";
import { createReadStream } from "fs";
import Artical from "../module/Artical";
import { logger } from "../utils/logger";
import { parseArtical, isUserPraised, unPraiseArtical } from "../module/service/ArticalParseService";
import { User, findUser } from "../module/User";
import { ArticalPraise } from "../module/ArticalPraise";



var ajaxtest = async (ctx: Context, next: Function) => {
    ctx.response.type = 'html';
    ctx.response.body = createReadStream('./static/html/ajaxtest.htm');
}
var wzqsq = async (ctx: Context, next: Function) => {
    ctx.response.type = 'html';
    ctx.response.body = createReadStream('./static/html/wzqsq.htm');
}
/**
 * 返回推送文章的service
 * 数据库事先存有一直到八月的数据, 拿到date<now的数据
 * 
 * @param ctx 
 * @param next 
 */
var SpushArticles = async (ctx: Context, next: Function) => {
    try {
        var size = ctx.request.body.size;
        var page = ctx.request.body.page;
        var username = ctx.request.body.username;
    } catch (err) {
        logger.error("pushArticles error: " + err);
        ctx.type = 'json';
        ctx.body = { msg: "error: user has not login" }
    }

    await pushArticals(page, size, username).then((result: Array<Artical>) => {
        ctx.type = 'json';
        ctx.body = { size: result.length, data: result }
    }).catch((err) => {
        logger.error('pushArticles error:', err);
        ctx.type = 'json';
        ctx.body = { msg: "some inputs is not a number or can not convert to a number" };
    });
    await next();
}
var pushArticalsByCollectid = async (ctx: Context, next: Function) => {
    try {
        var collectId = ctx.request.body.collectId;
        var articalsJson: any = await getArticalfromCollect(collectId);
        if (articalsJson) {
            ctx.type = 'json';
            ctx.body = { size: articalsJson.length, data:articalsJson }
        }else{
            ctx.type = 'json';
            ctx.body = {size:0, data:{msg:'collectid not found'}}
        }

    } catch (err) {
        logger.error("pushArticalsByCollectid error: " + err);
        ctx.type = 'json';
        ctx.body = {size:0, data:{msg:'collectid not found'}}
    }
}
var articalparse = async (ctx: Context, next: Function) => {
    var username = ctx.request.body.username;
    var articalid = ctx.request.body.articalid;

    if (await isUserPraised(username, articalid)) {
        logger.info('该用户已点过此文章的赞');
        ctx.body = { msg: 'err' };
        ctx.type = 'json';
        return;
    }

    await parseArtical(username, articalid).then((result) => {
        ctx.body = { msg: 'ok' };
        ctx.type = 'json';
    }).catch((err) => {
        logger.error(err);
        ctx.body = { msg: 'err' };
        ctx.type = 'json';
    });
    await next();
}
var unpraiseArtical = async (ctx: Context, next: Function) => {
    try {
        var username = ctx.request.body.username;
        var articalid = ctx.request.body.articalid;
    } catch (err) {
        logger.error("unpraiseArtical error " + err)
    }


    if (await isUserPraised(username, articalid)) {
        await unPraiseArtical(username, articalid);
    }
    ctx.body = { msg: 'ok' };
    ctx.type = 'json';

    await next();
}

var AddArtical = async (ctx: Context, next: Function) => {
    try {
        var title = ctx.request.body.title;
        var content = ctx.request.body.content;
        var username = ctx.session.username;
    } catch (err) {
        logger.error("AddArtical" + err);
    }

    var user = await User.findOne({ where: { username: username } });
    if (user) {
        await user.createArtical({ title: title, content: content });
        logger.info(`create a articl for user ${username}`);
        ctx.type = 'json';
        ctx.body = { msg: 'ok' };
        await next();

    } else {
        logger.error(`faile to create a articl for user ${username} `);
        ctx.type = 'json';
        ctx.body = { msg: 'username not found' };
        await next();

    }
}
var isUserPraise = async (ctx: Context, next: Function) => {
    try {
        var username = ctx.request.body.username;
        var articalid = ctx.request.body.articalid;
    } catch (err) {
        logger.error("isUserPraise error " + err);
        ctx.type = 'json';
        ctx.body = { msg: "error username or articalid note found" };
    }
    var isUserPraise = await isUserPraised(username, articalid);

    ctx.type = 'json';
    ctx.body = { msg: isUserPraise };
    await next();

}
var DeleteArtical = async (ctx: Context, next: Function) => {
    try {
        var userid = ctx.session.userid;
        var articalid = ctx.request.body.articalid;
    } catch (err) {
        logger.error("deleteArtical" + err);
    }

    var user = await User.findOne({ where: { id: userid } });
    var artical = await Artical.findOne({ where: { id: articalid } });
    if (user && artical) {
        if (deleteArtical(artical, user)) {
            ctx.type = 'json';
            ctx.body = { msg: 'ok' };
            await next();
        }
    } else {
        ctx.type = 'json';
        ctx.body = { msg: 'error user or artical not found or no permission' };
        await next();
    }
}

export = {
    'POST /getArticals': SpushArticles,
    'GET /ajaxtest': ajaxtest,
    'POST /articalpraise': articalparse,
    'GET /wzqsq': wzqsq,
    'POST /addArtical': AddArtical,
    'POST /unPraiseArtical': unpraiseArtical,
    'POST /isUserPraise': isUserPraise,
    'POST /deleteArtical': DeleteArtical,
    'POST /pushArticalsByCollectid':pushArticalsByCollectid,
}