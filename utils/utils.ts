var getJsonFromModelArr = async (modelarr:Array<any>,addfunc:Function)=>{
    var Jsonarr:any = [];
    for(var index in modelarr){
        Jsonarr[index] = modelarr[index].toJSON();
        await addfunc(modelarr[index] ,Jsonarr[index]);
    }
    return Jsonarr;
}

export {getJsonFromModelArr};