import { User } from "../User";
import { Collect } from "../Collect";

var getCollectsByUserId = async(userid:number)=>{
    var user = await User.findOne({where:{id:userid}});
    if(user){
        var collects = await user.getCollects();
        var collectsJson = [];
        if(collects){
            for(var index in collects){
                var collectJson:any = collects[index].toJSON();
                collectJson.countArticals = collects[index].countArticals();
                collectsJson.push(collectJson);
            }        
        }
        return collectsJson;
    }else{
        return false;
    }
}

var getDefaultCollect = async(userid:number)=>{
    return await Collect.findOne({where:{UserId:userid}});
}

export {getCollectsByUserId, getDefaultCollect};