import { User } from "../User";
import { Collect } from "../Collect";
import { verifyVariable } from "../../utils/utils";
import Artical from "../Artical";
import { Star } from "../Star";
import { Op } from "sequelize";
import { wrapArtical } from "./ArticalService";

var getCollectsByUserId = async(userid:number)=>{
    var user = await User.findOne({where:{id:userid}});
    if(user){
        var collects = await user.getCollects();
        var collectsJson = [];
        if(collects){
            for(var index in collects){
                var collectJson:any = collects[index].toJSON();
                collectJson.countArticals = await collects[index].countArticals();
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

var getArticalsFromCollect = async(userid:number, collectid:number)=>{
    verifyVariable(userid, collectid);
    var stararticleid = await Star.findAll({attributes:['ArticalId'],where:{CollectId:collectid, UserId:userid}});
    var staraticleidarr = [];//1.在文集收藏里面 2.原创的
    for(var i of stararticleid){
        staraticleidarr.push(i.getDataValue('ArticalId'));
    }

    var articles = await Artical.findAll({where:{
        [Op.or]:[{'id':staraticleidarr},{'UserId':userid, 'CollectId':collectid}]
    }});
    var articlejson:Array<any> = [];
    var user = await User.findOne({where:{id:userid}});
    if(user){
        for(var article in articles){
            articlejson[article] = await wrapArtical(articles[article], user.username);
        }
    }

    return articlejson;
}

export {getCollectsByUserId, getDefaultCollect, getArticalsFromCollect};