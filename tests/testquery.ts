import test from "ava";
import Artical from "../module/Artical";

test("query", async t=>{
    var idarr:any = [];
    var articals = (await Artical.findAll({attributes:['id'],where:{"UserId":1}})).forEach(function(Artical){
        idarr.push(Artical.getDataValue('id'));
    });
    console.log(articals);
    console.log(idarr);
})