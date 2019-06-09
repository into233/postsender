import { Context } from "koa";
import Artical from "../module/Artical";
import { User } from "../module/User";
import { getJsonFromModelArr, verifyVariable } from "../utils/utils";
import { isUserPraiseComment } from "../module/service/CommentPraiseService";
import { createComment, Comment } from "../module/Comment";
import { createCommentPraise, deleteCommentPraise, CommentPraise } from "../module/CommentPraise";
import { logger } from "../utils/logger";
import { pushAllUsergetComments } from "../module/service/CommentService";
import { MessageType, createMessage } from "../module/Message";


var getComments = async (ctx: Context, next: Function) => {
    try{
        var userid = ctx.session.userid;
        var articalid = ctx.request.body.articalid;
    }catch(err){
        logger.error("getComments error: " + err);
        ctx.type = 'json';
        ctx.body = { msg: 'error: user or artical not add' , data:[],size:0};
    }
    
    var artical = await Artical.findOne({ where: { id: articalid } });
    if (artical && userid != null) {
        var comments = await artical.getComments({order:[['createdAt','DESC'],]});
        var commentJson:Array<any> = await getJsonFromModelArr(comments, async (model: any, item: any) => {
            item.commentPraise = await model.countCommentPraises();
            item.isUserPraise = await isUserPraiseComment(userid, model.id);
            var commentUserId = item.UserId;
            var user = await User.findOne({where:{id:commentUserId}});
            if(user){
                item.username = user.username;
                item.headimage = user.headimage;
            }else{
                item.username = "admin";
                item.headimage = "defaultHead.jpg";
            }
        })
        ctx.type = 'json';
        ctx.body = {size: commentJson.length, data:commentJson};
        await next();
    } else {
        ctx.type = 'json';
        ctx.body = { msg: 'error: user or artical not found' };
    }
}

var addComment = async (ctx: Context, next: Function) => {
    try{
        var articalid = ctx.request.body.articalid;
        var content = ctx.request.body.content;
    }catch(error){
        logger.error("addComment not found id or content" + error);
        ctx.type = 'json';
        ctx.body = { msg: 'error: id or content not add' };
        return;
    }
    
    var userid = ctx.session.userid;
    if (userid) {
        var user = await User.findOne({ where: { id: userid } });
        if (user) {
            var comment =  await createComment({ content: content, UserId:user.id, ArticalId:articalid });
            if(comment){
                Artical.findOne({where:{id:articalid}}).then(function(artical){
                    createMessage({type:MessageType.addComment, CommentId:comment.id, UserId:artical != null ? artical.UserId:0});
                })

            }

            ctx.type = 'json';
            ctx.body = { msg: 'ok' };
            await next();
        } else {
            throw new Error("user not found");
        }
    } else {
        if (ctx.request.body.android) {
            ctx.type = 'json';
            ctx.body = { msg: 'error: please login', data:{} };
            await next();
        } else {
            ctx.redirect('/login');
            await next();
        }
    }
}
var commentPraise = async (ctx: Context, next: Function) => {
    
    try{
        var commentid = ctx.request.body.commentid;
        var userid = ctx.session.userid;
    }catch(error){
        logger.error("commentPraise not found commentid or userid" + error);
        ctx.type = 'json';
        ctx.body = { msg: 'error:commentid or userid not add' };
    }
    
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
    try{
        var commentid = ctx.request.body.commentid;
        var userid = ctx.session.userid;
    }catch(error){
        logger.error("unPraiseComment not found commentid or userid" + error);
        ctx.type = 'json';
        ctx.body = { msg: 'error: commentid or userid not add' };
    }
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
var pushAllUsergetCommentsController = async (ctx: Context, next: Function) => {
    var userid = ctx.request.body.userid;
    if(userid != undefined && userid != null){
        var comments = await pushAllUsergetComments(parseInt(userid));
        if(comments){
            ctx.body = {size:comments.length, data:comments};
            ctx.type = 'json';
        }else{
            ctx.myerr = 'unknown error';
            return;
        }
    }else{
        ctx.myerr = 'userid not found';
        return;
    }
}
var getUserOwnCommentsByArticalId = async(ctx:Context, next:Function)=>{
    var userid = ctx.request.body.userid;
    var articalid = ctx.request.body.articalid;

    if(!verifyVariable(userid, articalid)){
        ctx.myerr = 'need userid and articalid';
        logger.error("need userid and articalid");
        return;
    }

    var comments = await Comment.findAll({where:{ArticalId:articalid, UserId:userid}});
    var commentsJson:Array<any> = [];

    for(var comment of comments){
        commentsJson.push(comment.toJSON());
    }

    if(comments)
    ctx.body = {msg:"ok", size:comments.length, data:commentsJson};
    ctx.type = 'json';
}

export = {
    'POST /getComments': getComments,
    'POST /addComment': addComment,
    'POST /commentPraise':commentPraise,
    'POST /unPraiseComment':unPraiseComment,
    'POST /pushAllUsergetComments':pushAllUsergetCommentsController,
    'POST /getUserOwnComments':getUserOwnCommentsByArticalId
}