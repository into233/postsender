import { Context } from "koa";
import { logger } from "../utils/logger";
import { Star } from "../module/Star";


var addStar = async (ctx: Context, next: Function) => {
    try {
        var articleid = ctx.request.body.articleid;
        var userid = ctx.session.userid;
        var collectid = ctx.request.body.collectid;
    } catch (err) {
        logger.error("addStar error: articleid or userid or collectid not found");
        ctx.myerr = "addStar error: articleid or userid or collectid not found";
        return;
    }
    Star.create({ ArticleId: articleid, CollectId: collectid, UserId: userid });
    ctx.type = 'json';
    ctx.body = 'ok';
    await next();
}
var delStar = async (ctx: Context, next: Function) => {
    try {
        var articleid = ctx.request.body.articleid;
        var userid = ctx.session.userid;
        var collectid = ctx.request.body.collectid;
    } catch (err) {
        logger.error("delStar error: articleid or userid or collectid not found");
        ctx.myerr = "delStar error articleid or userid or collectid not found";
        return;
    }
    var star = await Star.findOne({ where: { ArticleId: articleid, CollectId: collectid, UserId: userid } });
    if (star) {
        star.destroy();
        ctx.type = 'json';
        ctx.body = 'ok';
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