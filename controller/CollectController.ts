import { Context } from "koa";
import { getCollectsByUserId } from "../module/service/CollectService";

var getCollectByUser = async(ctx:Context, next:Function)=>{
    try{
        var userid = ctx.request.body.userid;
    }catch(err){
        ctx.myerr = "userid not found";
        return;
    }
    var collects:Array<any>|false = await getCollectsByUserId(userid);
    if(collects){
        ctx.body = {size:collects.length, data:collects};
        ctx.type = 'json';
        await next();
    }else{
        ctx.myerr = 'error: no collects';
        return ;
    }
}

module.exports = {
    'POST /getCollectByUser': getCollectByUser,
}