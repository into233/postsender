import { User } from "../User";
import { logger } from "../../utils/logger";


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
        var userjson:any = nuser.toJSON();
        delete userjson.password;
        userjson.collectCount = await nuser.countCollects();
        userjson.articleCount = await nuser.countArticals();

        return userjson;
    }catch(err){
        // console.log(err);
        return null;
    }
    //DONT KNOW any questrion??
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
    }
}

export {getUserByidForUser, setUserHeadimg};