import { Context } from "koa";
import { logger } from "../utils/logger";
import { Star } from "../module/Star";
import { verifyVariable } from "../utils/utils";
import { Collect } from "../module/Collect";


var addStar = async (ctx: Context, next: Function) => {
    var articleid = ctx.request.body.articleid;
    var userid = ctx.request.body.userid;
    var collectid: any = ctx.request.body.collectid;
    if (!verifyVariable(articleid, userid)) {
        logger.error("addStar error: articleid or userid or collectid not found");
        ctx.myerr = "addStar error: articleid or userid or collectid not found";
        await next();
        return;
    }
    if (collectid == undefined) {
        collectid = await Collect.findOne({ where: { UserId: userid } });
        if (collectid) {
            collectid = collectid.id;
        }
    }

    if (await Star.findOne({ where: { ArticalId: articleid, CollectId: collectid, UserId: userid } })) {
        ctx.type = 'json';
        ctx.body = { msg: 'error: star has already exist' };
        logger.error('error: star has already exist');
        await next();
        return;
    }
    Star.create({ ArticalId: articleid, CollectId: collectid, UserId: userid });
    ctx.type = 'json';
    ctx.body = { msg: 'ok' };
    await next();
}
var delStar = async (ctx: Context, next: Function) => {

    // var articleid = ctx.request.body.articleid;
    // var userid = ctx.session.userid;
    // var collectid = ctx.request.body.collectid;

    let [articleid, userid, collectid] = ctx.request.body;//解构的妙用

    if (!verifyVariable(articleid, userid)) {
        logger.error("addStar error: articleid or userid not found");
        ctx.myerr = "addStar error: articleid or userid not found";
        await next();
        return;
    }
    var collect;
    if (collectid == undefined) {
        collect = await Collect.findOne({ where: { UserId: userid } });
    }
    if (collect) {
        var star = await Star.findOne({ where: { ArticalId: articleid, CollectId: collect.id, UserId: userid } });
        if (star) {
            star.destroy();
            ctx.type = 'json';
            ctx.body = { msg: 'ok' };
        } else {
            ctx.myerr = 'delerror star not found';
            return;
        }
        await next();
    }else{
        ctx.myerr = 'delerror star not found';
            return;
    }
}
module.exports = {
    'POST /addStar': addStar,
    'POST /delStar': delStar,
}