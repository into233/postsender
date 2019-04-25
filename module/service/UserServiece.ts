import { User } from "../User";


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

        return userjson;
    }catch(err){
        console.log(err);
        return null;
    }
    //DONT KNOW any questrion??
    return nuser;
}

export {getUserByidForUser};