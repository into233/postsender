import sequelize from "../db";
import { Collect } from "../module/Collect";
import { CommentPraise } from "../module/CommentPraise";
import Artical from "../module/Artical";
import { User } from "../module/User";
import { ArticalPraise } from "../module/ArticalPraise";
import { Follower } from "../module/Follower";
import { Star } from "../module/Star";

async function sync() {
    await sequelize.sync().then();
    await Collect.findAll();
    await CommentPraise.findAll();
    await User.findAll();
    await Artical.findAll();
    await ArticalPraise.findAll();
    await Follower.findAll();
    await Star.findAll();
}


var destroyalldata = async(datas: any) =>{
    for(var i in datas){
        await datas[i].destroy();
    }

}

function adddata(datas: any, instancename: string, instance: any) {
    datas[instancename] = instance;
}

export {sync, destroyalldata, adddata};