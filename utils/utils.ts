var getJsonFromModelArr = async (modelarr:Array<any>,addfunc:Function)=>{
    var Jsonarr:any = [];
    for(var index in modelarr){
        Jsonarr[index] = modelarr[index].toJSON();
        await addfunc(modelarr[index] ,Jsonarr[index]);
    }
    return Jsonarr;
}

var verifyVariable = function(...args: any[]){
    for(var i of args){
        if(i == undefined || i == null){
            return false;
        }
    }
    return true;
}

export {getJsonFromModelArr, verifyVariable};