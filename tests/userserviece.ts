import test from "ava";
import { getUserByidForUser } from "../module/service/UserService";



test('userserviece test', async t=>{
    var ustu = await getUserByidForUser(1);
    t.true(ustu != null);
    
    console.log(ustu);
    if(ustu){
        t.true(ustu.password == null);
    }
})