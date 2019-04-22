import test from "ava";
import { adddata, sync, destroyalldata } from "../utils/tests";
import { createUser } from "../module/User";
import Artical from "../module/Artical";
import { Collect, createCollect } from "../module/Collect";


var data:any = {};

var fakedata = async()=>{
    adddata(data, 'user', await createUser({username:'testcollect', gender:'male', password:'123321'}));
    adddata(data, 'artical', await Artical.create({content:'for test collect'}));
    data.user.addArtical(data.artical);
}

//can i know the artical's owner 
test("add collect test", async t=>{
    await sync();
    await fakedata();
    var collect1 = await createCollect(data.user, '');
    console.log('collect1 create complete' + collect1.UserId);

    var collect = await createCollect(data.user, '');
    t.true(collect != null);
    if(collect){
        t.is(collect.UserId, data.user.id);
        console.log('add collect test success');
        collect1.destroy();
        collect.destroy();
    }
    destroyalldata(data);
})