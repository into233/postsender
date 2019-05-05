import { Context } from "koa";
import Artical from "../module/Artical";
import { User } from "../module/User";
import { getJsonFromModelArr } from "../utils/utils";
import { isUserPraiseComment } from "../module/service/CommentPraiseService";
import { createComment, Comment } from "../module/Comment";
import { createCommentPraise, deleteCommentPraise, CommentPraise } from "../module/CommentPraise";
import { logger } from "../utils/logger";


var getComments = async (ctx: Context, next: Function) => {
    var username = ctx.request.body.username;
    var articalid = ctx.request.body.articalid;

    var user: any = await User.findOne({ where: { username: username } });
    var artical = await Artical.findOne({ where: { id: articalid } });
    if (artical && user != null) {
        var comments = await artical.getComments({order:[['createdAt','DESC'],]});
        var commentJson = await getJsonFromModelArr(comments, async (model: any, item: any) => {
            item.commentPraise = await model.countCommentPraises();
            item.isUserPraise = await isUserPraiseComment(user.id, model.id);
            item.praised = null;
        })
        ctx.type = 'json';
        ctx.body = commentJson;
        await next();
    } else {
        ctx.type = 'json';
        ctx.body = { msg: 'error: user or artical not found' };
    }
}

var addComment = async (ctx: Context, next: Function) => {
    var articalid = ctx.request.body.articalid;
    var content = ctx.request.body.content;

    var username = ctx.session.username;
    if (username) {
        var user = await User.findOne({ where: { username: username } });
        if (user) {
            await createComment({ content: content, UserId:user.id, ArticalId:articalid });
            ctx.type = 'json';
            ctx.body = { msg: 'ok' };
        } else {
            throw new Error("user not found");
        }
    } else {
        if (ctx.request.body.android) {
            ctx.type = 'json';
            ctx.body = { msg: 'error: please login' };
        } else {
            ctx.redirect('/login');
        }
    }
}
var commentPraise = async (ctx: Context, next: Function) => {
    var commentid = ctx.request.body.commentid;
    var userid = ctx.session.userid;
    
    var user = await User.findOne({where:{id:userid}});
    var comment = await Comment.findOne({where:{id:commentid}});
    if(user && comment){
        if(await CommentPraise.findOne({where:{UserId:user.id, CommentId:comment.id}})){
            ctx.type = 'json';
            ctx.body = {msg:'error user have already praised'};
            return;
        }

        await createCommentPraise(comment,user);
        logger.info("create a commentpraise for user " + user.username);
        ctx.type = 'json';
        ctx.body = {msg:'ok'};
        await next();
    }else{
        logger.info("error in create a commentpraise for user");
        ctx.type = 'json';
        ctx.body = {msg:'error cannot find user or comment'};
    }
}

var unPraiseComment = async (ctx: Context, next: Function) => {
    var commentid = ctx.request.body.commentid;
    var userid = ctx.session.userid;
    
    
    if(userid && commentid){
        await deleteCommentPraise(userid,commentid);
        logger.info('user delete comment praise');
        ctx.type = 'json';
        ctx.body = {msg:'ok'};
        await next();
    }else{
        ctx.type = 'json';
        ctx.body = {msg:'error cannot find user or comment'};
    }
}
export = {
    'POST /getComments': getComments,
    'POST /addComment': addComment,
    'POST /commentPraise':commentPraise,
    'POST /unPraiseComment':unPraiseComment,
}