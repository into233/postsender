import { Context } from "koa";
import { verifyVariable } from "../utils/utils";
import { getMessages } from "../module/service/MessageService";
import { Message } from "../module/Message";



var getMessagesContorller = async(ctx:Context, next:Function)=>{
    var userid = ctx.request.body.userid;

    if(!verifyVariable(userid)){
        ctx.myerr = "please login!";
        return;
    }
    var messages = await getMessages(userid);
    ctx.body = {msg:"ok", size:messages.length, data:messages};
    ctx.type = 'json';
    await next();    
}

var delMessage = async(ctx:Context, next:Function)=>{
    var messageid = ctx.request.body.messageid;

    if(!verifyVariable(messageid)){
        ctx.myerr = "messageid is necessary";
        return;
    }
    if(ctx.session.userid == undefined){
        ctx.myerr = "please login";
        return;
    }
    var message = await Message.findOne({where:{id:messageid}});
    if(message && message.UserId != ctx.session.userid){
        ctx.myerr = "that is not your message!";
        return;
    }
    if(message){
        message.destroy();
        ctx.body = {msg:"ok"};
        ctx.type = 'json';
        await next();
    }else{
        ctx.myerr = {msg:"message not found"};
        return;
    }
}

module.exports = {
    'POST /getMessagesContorller': getMessagesContorller,
    'POST /delMessage': delMessage,
}