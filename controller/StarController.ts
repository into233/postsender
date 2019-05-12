import { Context } from "koa";
import { logger } from "../utils/logger";
import { Star } from "../module/Star";
import { verifyVariable } from "../utils/utils";


var addStar = async (ctx: Context, next: Function) => {
    var articleid = ctx.request.body.articleid;
    var userid = ctx.request.body.userid;
    var collectid = ctx.request.body.collectid;
    if (!verifyVariable(articleid, userid, collectid)) {
        logger.error("addStar error: articleid or userid or collectid not found");
        ctx.myerr = "addStar error: articleid or userid or collectid not found";
        await next();
        return;
    }

    if (await Star.findOne({ where: { ArticalId: articleid, CollectId: collectid, UserId: userid } })) {
        ctx.type = 'json';
        ctx.body = {msg:'error: star has already exist'};
        logger.error('error: star has already exist');
        await next();
        return;
    }
    Star.create({ ArticalId: articleid, CollectId: collectid, UserId: userid });
    ctx.type = 'json';
    ctx.body = {msg:'ok'};
    await next();
}
var delStar = async (ctx: Context, next: Function) => {

    var articleid = ctx.request.body.articleid;
    var userid = ctx.session.userid;
    var collectid = ctx.request.body.collectid;
    if (!verifyVariable(articleid, userid, collectid)) {
        logger.error("addStar error: articleid or userid or collectid not found");
        ctx.myerr = "addStar error: articleid or userid or collectid not found";
        await next();
        return;
    }
    var star = await Star.findOne({ where: { ArticalId: articleid, CollectId: collectid, UserId: userid } });
    if (star) {
        star.destroy();
        ctx.type = 'json';
        ctx.body = {msg:'ok'};
    } else {
        ctx.myerr = 'delerror star not found';
        return;
    }
    await next();
}
module.exports = {
    'POST /addStar': addStar,
    'POST /delStar': delStar
}