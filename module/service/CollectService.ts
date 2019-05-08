import { User } from "../User";

var getCollectsByUserId = async(userid:number)=>{
    var user = await User.findOne({where:{id:userid}});
    if(user){
        return await user.getCollects().toJSON();
    }else{
        return false;
    }
}

export = {getCollectsByUserId};