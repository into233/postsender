import { Context } from "koa";
import { logger } from "../utils/logger";
import { User } from "../module/User";
import { where } from "sequelize/types";
import { createFollower, Follower } from "../module/Follower";

var FanSomebody = async(ctx:Context, next:Function)=>{
    try{
        var userid = ctx.request.body.userid;
        var fanid:any = ctx.session.userid | ctx.request.body.fanid;
    }catch(err){
        logger.error("FanSomebody error id" + err);
        ctx.myerr = "userid or fanid not found";
    }
    try{
        var user = await User.findOne({where:{id:userid}});
        var fan = await User.findOne({where:{id:fanid}});

        if(user && fan){
            if(await Follower.findOne({where:{UserId:user.id, FanId:fan.id}}))
                {
                    logger.error("follower has already exists");
                    ctx.myerr = "follower has already exists";
                    await next();
                    return;
                }
            createFollower(user,fan);
            ctx.type = 'json';
            ctx.body = {msg:'ok'};
        }else{
            logger.error("FanSomebody error model");
            ctx.myerr = "user or fan not found";
            await next();
            return;
        }
    }catch(err){
        logger.error("FanSomebody error sql" + err);
        ctx.myerr = "sql error";
    }
}
var unFanSomebody = async(ctx:Context, next:Function)=>{
    try{
        var userid = ctx.request.body.userid;
        var fanid:any = ctx.session.userid | ctx.request.body.fanid;        
    }catch(err){
        logger.error("FanSomebody error id" + err);
        ctx.myerr = "userid or fanid not found";
    }
    try{
        var user = await User.findOne({where:{id:userid}});
        var fan = await User.findOne({where:{id:fanid}});
        if(user && fan){
            var follower = await Follower.findOne({where:{UserId:user.id, FanId:fan.id}});
            if(follower){
                follower.destroy();
                ctx.type = 'json';
                ctx.body = {msg:'ok'};
            }else{
                ctx.myerr = "fan is not the uesr's fan";
            }
        }else{
            logger.error("FanSomebody error model");
            ctx.myerr = "user or fan not found";
        }
    }catch(err){
        logger.error("FanSomebody error sql" + err);
        ctx.myerr = "sql error";
    }
}

export = {
    'POST /flollow': FanSomebody,
    'POST /unfollow': unFanSomebody,
}