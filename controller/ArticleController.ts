import { Context } from "koa";
import { pushArticals, deleteArtical, getArticalfromCollect, pushPusherArtical, wrapArtical } from "../module/service/ArticalService";
import { createReadStream } from "fs";
import Artical from "../module/Artical";
import { logger } from "../utils/logger";
import { parseArtical, isUserPraised, unPraiseArtical } from "../module/service/ArticalParseService";
import { User } from "../module/User";
import { getDefaultCollect, getArticalsFromCollect } from "../module/service/CollectService";
import { Collect } from "../module/Collect";
import { verifyVariable } from "../utils/utils";



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
        var userid = ctx.request.body.userid;
    } catch (err) {
        logger.error("pushArticles error: " + err);
        ctx.type = 'json';
        ctx.body = { msg: "error: user has not login" }
    }

    await pushArticals(page, size, userid).then((result: Array<Artical>) => {
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
            ctx.body = { size: articalsJson.length, data: articalsJson }
        } else {
            ctx.type = 'json';
            ctx.body = { size: 0, data: { msg: 'collectid not found' } }
        }

    } catch (err) {
        logger.error("pushArticalsByCollectid error: " + err);
        ctx.type = 'json';
        ctx.body = { size: 0, data: { msg: 'collectid not found' } }
    }
}
var articalparse = async (ctx: Context, next: Function) => {
    var userid = ctx.request.body.userid;
    var articalid = ctx.request.body.articalid;

    if (await isUserPraised(userid, articalid)) {
        logger.info('该用户已点过此文章的赞');
        ctx.body = { msg: 'err 该用户已点过此文章的赞' };
        ctx.type = 'json';
        return;
    }

    await parseArtical(userid, articalid).then((result) => {
        ctx.body = { msg: 'ok' };
        ctx.type = 'json';
    }).catch((err) => {
        logger.error(err);
        ctx.body = { msg: 'err 服务器出错' };
        ctx.type = 'json';
    });
    await next();
}
var unpraiseArtical = async (ctx: Context, next: Function) => {
    try {
        var userid = ctx.request.body.userid;
        var articalid = ctx.request.body.articalid;
    } catch (err) {
        logger.error("unpraiseArtical error " + err)
        ctx.body = { msg: 'error userid or articalid not found' };
        ctx.type = 'json';
    }


    if (await isUserPraised(userid, articalid)) {
        await unPraiseArtical(userid, articalid);
    }
    ctx.body = { msg: 'ok' };
    ctx.type = 'json';

    await next();
}

var AddArtical = async (ctx: Context, next: Function) => {
    var imgfile;
    var title = ctx.request.body.title || '';
    var content = ctx.request.body.content || '';
    var userid = ctx.session.userid;
    var collectid = ctx.request.body.collectid || '';
    if (ctx.request.files)
        imgfile = ctx.request.files.file.name;
    if (!verifyVariable(userid)) {

        logger.error("AddArtical error");
        ctx.myerr = "please login!";
        return;
    }

    var user = await User.findOne({ where: { id: userid } });
    if (user) {
        var artical = await user.createArtical({ title: title, content: content, imagedir: imgfile || 'defaultImage.jpg' });
        if (collectid == '') {
            var defaultCollect = await getDefaultCollect(user.id);
            if (defaultCollect && artical) {
                defaultCollect.addArtical(artical);
            }
        } else {
            var collect = await Collect.findOne({ where: { id: collectid } });
            if (collect) {
                collect.addArtical(artical);
            } else {
                var defaultcollect = await Collect.create({ UserId: user.id, title: "默认文集" });
                defaultcollect.addArtical(artical);
                return;
            }
        }
        logger.info(`create a articl for user ${userid}`);
        ctx.type = 'json';
        ctx.body = { msg: 'ok' };
        await next();
    } else {
        logger.error(`faile to create a articl for user ${userid} `);
        ctx.type = 'json';
        ctx.body = { msg: 'userid not found' };
        await next();
    }
}
var isUserPraise = async (ctx: Context, next: Function) => {
    var userid = ctx.request.body.userid;
    var articalid = ctx.request.body.articalid;
    if (!verifyVariable(userid, articalid)) {
        logger.error("isUserPraise error: userid or articalid  not found");
        ctx.myerr = "isUserPraise error: articalid or userid not found";
        await next();
        return;
    }
    var isUserPraise = await isUserPraised(userid, articalid);

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
    if (user) {
        if (artical) {
            if (deleteArtical(artical, user)) {
                ctx.type = 'json';
                ctx.body = { msg: 'ok' };
                await next();
            }
        } else {

        }
    } else {
        ctx.type = 'json';
        ctx.body = { msg: 'error user or artical not found or no permission' };
        await next();
    }
}
var pushPusherArticalContorllser = async (ctx: Context, next: Function) => {
    var userid = ctx.request.body.userid;
    var size = ctx.request.body.size;
    var page = ctx.request.body.page;

    var articals: Array<any> = await pushPusherArtical(parseInt(page), parseInt(size), parseInt(userid));
    try {
        ctx.body = { size: articals.length, data: articals };
        ctx.type = 'json';
    } catch (err) {
        ctx.myerr = 'error articals not found';
    }
}
var getArticalsFromCollectController = async (ctx: Context, next: Function) => {
    var userid = ctx.request.body.userid;
    var collectid = ctx.request.body.collectid;
    if (!verifyVariable(userid, collectid)) {
        ctx.myerr = 'getArticalsFromCollectController error: userid or collectid not found';
        await next();
        return;
    }
    var articles = await getArticalsFromCollect(userid, collectid);
    ctx.body = { size: articles.length, data: articles };
    ctx.type = 'json';
    await next();
}
var getArticleById = async(ctx:Context, next:Function)=>{
    var articleid = ctx.request.body.articleid;
    var userid = ctx.request.body.userid;
    if(!verifyVariable(articleid, userid)){
        ctx.myerr = "error: need article id";
        await next();
        return;
    }
    if(typeof articleid != "number"){
        if(typeof articleid == "string"){
            articleid = parseInt(articleid);
        }else{
            ctx.myerr = "articleid type is not format";
            await next();
            return;
        }
    }
    
    var article = await Artical.findOne({where:{id:articleid}});
    if(article){
        var articlejson = await wrapArtical(article, userid);
        ctx.body = {msg:"ok", data:articlejson}
        ctx.type = 'json';
    }else{
        ctx.myerr = "error: cannot find the article";
    }
}

export = {
    'POST /getArticals': SpushArticles,
    'GET /ajaxtest': ajaxtest,
    'POST /articalpraise': articalparse,
    'POST /getArticleById':getArticleById,
    'GET /wzqsq': wzqsq,
    'POST /addArtical': AddArtical,
    'POST /unPraiseArtical': unpraiseArtical,
    'POST /isUserPraise': isUserPraise,
    'POST /deleteArtical': DeleteArtical,
    'POST /pushArticalsByCollectid': pushArticalsByCollectid,
    'POST /pushPusherArtical': pushPusherArticalContorllser,
    'POST /getArticalsFromCollect': getArticalsFromCollectController,
}