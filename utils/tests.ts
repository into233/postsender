import sequelize from "../db";
import { Collect } from "../module/Collect";
import { CommentPraise } from "../module/CommentPraise";
import Artical from "../module/Artical";
import { User } from "../module/User";
import { ArticalPraise } from "../module/ArticalPraise";

async function sync() {
    await sequelize.sync().then();
    await Collect.findAll();
    await CommentPraise.findAll();
    await User.findAll();
    await Artical.findAll();
    await ArticalPraise.findAll();
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