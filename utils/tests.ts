import sequelize from "../db";

async function sync() {
    await sequelize.sync().then();
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