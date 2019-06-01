import { User } from "../User";
import { logger } from "../../utils/logger";
import { Follower } from "../Follower";


/** 
 * 在用户端获取其他用户信息 去掉password
 */
var getUserByidForUser = async(userid:number|string)=>{
    var nuser;
    try{
        nuser =await User.findOne({where:{id:userid}});
        if(!nuser){
            throw new Error('user not found');
        }
        
        return wrapUser(nuser);
    }catch(err){
        // console.log(err);
        return null;
    }
    //DONT KNOW any questrion??
}

var wrapUser = async(user:User)=>{
    var userJson:any = user.toJSON();

    userJson.collectCount = await user.countCollects();
    userJson.articleCount = await user.countArticals();
    userJson.PusherCounts = await Follower.count({where:{FanId:user.id}});
    userJson.FollowerCounts = await Follower.count({where:{UserId:user.id}});
    delete userJson.password;

    return userJson;
}


/**
 * 设置用户头像
 */
var setUserHeadimg = async(userid:number, imgpath:string)=>{
    try{
        var user = await User.findOne({where:{id:userid}});
        if(user){
            user.headimage = imgpath;
            user.save();
        }else{
            return false;
        }
    }catch(err){
        logger.error(err);
        return false;
    }
}

var getUserFollowers = async(userid:number)=>{
    try{
        var FansId: Array<any> = [];
        (await Follower.findAll({ attributes: ['FanId'], where: { UserId: userid } })).forEach(function (Follower) {
            FansId.push(Follower.getDataValue('FanId'));
        });
        var fans = await User.findAll({where:{id:FansId}});

        var fansjson:Array<any> = []; 
        fans.forEach(async(user, index)=>{
            fansjson.push(await wrapUser(user));
        });

        return fansjson;
    }catch(err){
        return [];
    }
}

var getUserPushers = async(fanid:number)=>{
    try{
        var PusherIds: Array<any> = [];
        (await Follower.findAll({ attributes: ['UserId'], where: { Fanid: fanid } })).forEach(function (Follower) {
            PusherIds.push(Follower.getDataValue('UserId'));
        });
        var pusher = await User.findAll({where:{id:PusherIds}});

        var pusherjson:Array<any> = []; 
        pusher.forEach(async(user, index)=>{
            pusherjson.push(await wrapUser(user));
        });

        return pusherjson;
    }catch(err){
        logger.error('ERROR: getUserFollowers ' + err);
        return [];
    }
}

export {getUserByidForUser, setUserHeadimg,wrapUser, getUserFollowers, getUserPushers};